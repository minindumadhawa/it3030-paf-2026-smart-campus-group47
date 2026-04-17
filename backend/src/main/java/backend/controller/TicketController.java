package backend.controller;

import backend.dto.*;
import backend.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:3000")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    // POST /api/tickets
    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(@RequestBody TicketRequest request) {
        TicketResponse response = ticketService.createTicket(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // GET /api/tickets/my
    @GetMapping("/my")
    public ResponseEntity<List<TicketResponse>> getMyTickets(@RequestParam Long userId) {
        List<TicketResponse> tickets = ticketService.getMyTickets(userId);
        return new ResponseEntity<>(tickets, HttpStatus.OK);
    }

    // GET /api/tickets/{id}
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestParam String role) {
        TicketResponse response = ticketService.getTicketById(id, userId, role);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Admin: Assign a staff member to a ticket
    @PutMapping("/{id}/assign")
    public ResponseEntity<TicketResponse> assignStaff(@PathVariable Long id, @RequestBody TicketAssignRequest request) {
        TicketResponse updated = ticketService.assignStaff(id, request);
        return ResponseEntity.ok(updated);
    }

    // Admin: Update ticket status
    @PutMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(@PathVariable Long id, @RequestBody TicketStatusRequest request) {
        TicketResponse updated = ticketService.updateStatus(id, request);
        return ResponseEntity.ok(updated);
    }

    // Admin: Update resolution notes
    @PutMapping("/{id}/resolution")
    public ResponseEntity<TicketResponse> updateResolution(@PathVariable Long id, @RequestBody TicketResolutionRequest request) {
        TicketResponse updated = ticketService.updateResolution(id, request);
        return ResponseEntity.ok(updated);
    }
}
