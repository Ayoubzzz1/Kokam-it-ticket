from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .models import Category, Department, EmployeeRequest, Notification, Ticket

User = get_user_model()


class TicketRoleWorkflowTests(APITestCase):
    def setUp(self):
        self.it = Department.objects.get_or_create(name="IT")[0]
        self.commercial = Department.objects.get_or_create(name="Commercial")[0]
        self.category = Category.objects.get_or_create(name="IT / PC", defaults={"slug": "it-pc"})[0]
        self.user = User.objects.create_user(
            email="user@test.local",
            password="pass12345",
            first_name="Jean",
            last_name="Dupont",
            role=User.Role.USER,
            department=self.commercial,
            office="Commercial-bureau 1",
        )
        self.other = User.objects.create_user(
            email="other@test.local",
            password="pass12345",
            first_name="Marie",
            last_name="Martin",
            role=User.Role.USER,
            department=self.commercial,
            office="Commercial-bureau 2",
        )
        self.tech = User.objects.create_user(
            email="tech@test.local",
            password="pass12345",
            first_name="Ahmed",
            last_name="IT",
            role=User.Role.TECHNICIAN,
            department=self.it,
            office="IT-bureau 1",
        )
        self.tech2 = User.objects.create_user(
            email="tech2@test.local",
            password="pass12345",
            first_name="Sara",
            last_name="IT",
            role=User.Role.TECHNICIAN,
            department=self.it,
            office="IT-bureau 2",
        )

    def auth(self, user):
        self.client.force_authenticate(user)

    def create_ticket(self, as_user=None):
        self.auth(as_user or self.user)
        res = self.client.post(
            "/api/tickets/",
            {
                "category": self.category.id,
                "title": "PC en panne",
                "description": "Écran noir",
                "priority": "high",
            },
            format="json",
        )
        self.assertEqual(res.status_code, 201, res.data)
        return res.data

    def test_technician_cannot_create_ticket(self):
        self.auth(self.tech)
        res = self.client.post(
            "/api/tickets/",
            {
                "category": self.category.id,
                "title": "Ne doit pas passer",
                "description": "IT ne crée pas",
                "priority": "low",
            },
            format="json",
        )
        self.assertEqual(res.status_code, 403)

    def test_user_cannot_list_it_tickets(self):
        self.create_ticket()
        self.auth(self.user)
        self.assertEqual(self.client.get("/api/tickets/").status_code, 403)
        self.assertEqual(self.client.get("/api/it-tickets/").status_code, 403)

    def test_user_sees_only_own_requests(self):
        ticket = self.create_ticket()
        self.create_ticket(self.other)
        self.auth(self.user)
        ids = [t["id"] for t in self.client.get("/api/my-requests/").data]
        self.assertEqual(ids, [ticket["id"]])

    def test_ticket_is_assigned_to_it_and_has_sender_data(self):
        ticket = self.create_ticket()
        self.assertIsNotNone(ticket["assigned_technician"])
        self.assertEqual(ticket["created_by"], self.user.id)
        self.assertEqual(ticket["bureau"], "Commercial-bureau 1")
        self.auth(self.tech if ticket["assigned_technician"] == self.tech.id else self.tech2)
        detail = self.client.get(f"/api/tickets/{ticket['id']}/").data
        self.assertEqual(detail["created_by_name"], "Jean Dupont")
        self.assertEqual(detail["created_by_department"], "Commercial")
        self.assertIn("Écran noir", detail["description"])

    def test_it_sets_in_progress_user_sets_done(self):
        ticket = self.create_ticket()
        tech_id = ticket["assigned_technician"]
        tech = self.tech if tech_id == self.tech.id else self.tech2
        other_tech = self.tech2 if tech.id == self.tech.id else self.tech

        self.auth(self.user)
        denied = self.client.patch(f"/api/tickets/{ticket['id']}/", {"status": "in_progress"}, format="json")
        self.assertEqual(denied.status_code, 403)

        self.auth(tech)
        res = self.client.patch(f"/api/tickets/{ticket['id']}/", {"status": "in_progress"}, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["status"], "in_progress")

        self.auth(self.user)
        self.assertEqual(self.client.get(f"/api/tickets/{ticket['id']}/").data["status"], "in_progress")

        self.auth(tech)
        it_denied = self.client.patch(f"/api/tickets/{ticket['id']}/", {"status": "done"}, format="json")
        self.assertEqual(it_denied.status_code, 403)

        self.auth(other_tech)
        self.assertIn(
            self.client.patch(f"/api/tickets/{ticket['id']}/", {"status": "done"}, format="json").status_code,
            (403, 404),
        )

        self.auth(self.user)
        done = self.client.patch(f"/api/tickets/{ticket['id']}/", {"status": "done"}, format="json")
        self.assertEqual(done.status_code, 200)
        self.assertEqual(done.data["status"], "done")
        self.assertTrue(done.data.get("intervention_duration") or done.data.get("resolution_time"))

        self.assertEqual(self.client.get("/api/my-requests/").data, [])
        hist = self.client.get("/api/my-requests/", {"status": "done"}).data
        self.assertEqual([t["id"] for t in hist], [ticket["id"]])

        self.auth(tech)
        self.assertEqual(self.client.get("/api/it-tickets/").data, [])
        hist = self.client.get("/api/it-tickets/", {"status": "done"}).data
        self.assertEqual([t["id"] for t in hist], [ticket["id"]])

    def test_tickets_are_not_deleted(self):
        ticket = self.create_ticket()
        self.auth(self.tech)
        res = self.client.delete(f"/api/tickets/{ticket['id']}/")
        self.assertEqual(res.status_code, 405)
        self.assertTrue(Ticket.objects.filter(id=ticket["id"]).exists())

    def test_public_registration_is_disabled(self):
        res = self.client.post(
            "/api/auth/register/",
            {
                "last_name": "IT",
                "first_name": "New",
                "department": self.it.id,
                "office_number": 9,
                "email": "new.it@test.local",
                "password": "Pass12345!",
                "confirm_password": "Pass12345!",
            },
            format="json",
        )
        self.assertEqual(res.status_code, 403)
        self.assertFalse(User.objects.filter(email="new.it@test.local").exists())

    def test_employee_requests_are_private_and_single_record_workflow(self):
        self.auth(self.user)
        created = self.client.post(
            "/api/employee-requests/",
            {"kind": "advance", "amount": "500.00", "motif": "Besoin exceptionnel"},
            format="json",
        )
        self.assertEqual(created.status_code, 201, created.data)
        request_id = created.data["id"]

        self.auth(self.other)
        self.assertEqual(self.client.get(f"/api/employee-requests/{request_id}/").status_code, 404)

        self.auth(self.user)
        self.assertEqual(self.client.get("/api/my-employee-requests/").data[0]["id"], request_id)
        denied = self.client.patch(
            f"/api/employee-requests/{request_id}/", {"status": "approved"}, format="json"
        )
        self.assertEqual(denied.status_code, 403)

        hr = User.objects.create_user(
            email="hr@test.local", password="pass12345", first_name="RH", last_name="User", role=User.Role.HR
        )
        self.auth(hr)
        approved = self.client.patch(
            f"/api/employee-requests/{request_id}/", {"status": "approved"}, format="json"
        )
        self.assertEqual(approved.status_code, 200)
        self.assertEqual(EmployeeRequest.objects.get(id=request_id).status, EmployeeRequest.Status.APPROVED)

    def test_request_notifications_follow_destination(self):
        hr = User.objects.create_user(
            email="hr-routing@test.local", password="pass12345", first_name="RH", last_name="Route", role=User.Role.HR
        )
        admin = User.objects.create_superuser(
            email="admin-routing@test.local", password="pass12345", first_name="Admin", last_name="Route"
        )
        self.auth(self.user)
        leave = self.client.post(
            "/api/employee-requests/",
            {"kind": "leave", "leave_type": "annual", "start_date": "2026-09-10", "end_date": "2026-09-11"},
            format="json",
        )
        self.assertEqual(leave.status_code, 201, leave.data)
        self.assertEqual(
            Notification.objects.filter(related_request_id=leave.data["id"], user__in=[hr, admin]).count(), 2
        )

        general = self.client.post(
            "/api/employee-requests/",
            {"kind": "general", "destination": "hr", "title": "Attestation", "motif": "Besoin d'un document"},
            format="json",
        )
        self.assertEqual(general.status_code, 201, general.data)
        self.assertTrue(Notification.objects.filter(related_request_id=general.data["id"], user=hr).exists())
        self.assertFalse(Notification.objects.filter(related_request_id=general.data["id"], user=admin).exists())
