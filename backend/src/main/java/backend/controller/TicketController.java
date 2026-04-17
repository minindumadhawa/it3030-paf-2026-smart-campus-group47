package backend.controller;

import backend.dto.*;
import backend.exception.TicketNotFoundException;
import backend.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:3000")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    // POST /api/tickets
    // Create a new ticket (logged-in user)
    @PostMapping
    public ResponseEntity<?> createTicket(@RequestBody TicketRequest request) {
        try {
            TicketResponse response = ticketService.createTicket(request);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }

    // GET /api/tickets/my?userId=1
    // Get all tickets submitted by the logged-in user
    @GetMapping("/my")
    public ResponseEntity<?> getMyTickets(@RequestParam Long userId) {
        try {
            List<TicketResponse> tickets = ticketService.getMyTickets(userId);
            return new ResponseEntity<>(tickets, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }

    // GET /api/tickets/{id}?userId=1&role=USER
    // Get a single ticket by ID
    // Users can only view their own; Admin can view any
    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketById(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestParam String role) {
        try {
            TicketResponse response = ticketService.getTicketById(id, userId, role);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (TicketNotFoundException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
        }
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
