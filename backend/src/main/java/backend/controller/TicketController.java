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

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(@RequestBody TicketRequest request) {
        return new ResponseEntity<>(ticketService.createTicket(request), HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<List<TicketResponse>> getMyTickets(@RequestParam Long userId) {
        return ResponseEntity.ok(ticketService.getMyTickets(userId));
    }

    @GetMapping
    public ResponseEntity<List<TicketResponse>> getAllTickets(@RequestParam String role) {
        return ResponseEntity.ok(ticketService.getAllTickets(role));
    }


    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestParam String role) {
        return ResponseEntity.ok(ticketService.getTicketById(id, userId, role));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<TicketResponse> assignStaff(@PathVariable Long id, @RequestBody TicketAssignRequest request) {
        return ResponseEntity.ok(ticketService.assignStaff(id, request));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(@PathVariable Long id, @RequestBody TicketStatusRequest request) {
        return ResponseEntity.ok(ticketService.updateStatus(id, request));
    }

    @PutMapping("/{id}/resolution")
    public ResponseEntity<TicketResponse> updateResolution(@PathVariable Long id, @RequestBody TicketResolutionRequest request) {
        return ResponseEntity.ok(ticketService.updateResolution(id, request));
    }
}
