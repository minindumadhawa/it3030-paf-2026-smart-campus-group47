package backend.controller;

import backend.exception.TicketNotFoundException;
import backend.model.Ticket;
import backend.model.TicketStatus;
import backend.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:3000")
public class TicketController {

    @Autowired
    private TicketRepository ticketRepository;

    // Create a new ticket (Student submits a ticket)
    @PostMapping
    public ResponseEntity<Ticket> createTicket(@RequestBody Ticket ticket) {
        Ticket savedTicket = ticketRepository.save(ticket);
        return new ResponseEntity<>(savedTicket, HttpStatus.CREATED);
    }

    // Get all tickets submitted by a specific user (Student view)
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Ticket>> getTicketsByUser(@PathVariable Long userId) {
        List<Ticket> tickets = ticketRepository.findByUserId(userId);
        return new ResponseEntity<>(tickets, HttpStatus.OK);
    }

    // Get all tickets (Admin view)
    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets() {
        List<Ticket> tickets = ticketRepository.findAll();
        return new ResponseEntity<>(tickets, HttpStatus.OK);
    }

    // Update ticket status (Admin updates the status)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateTicketStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<Ticket> optionalTicket = ticketRepository.findById(id);

        if (optionalTicket.isEmpty()) {
            throw new TicketNotFoundException("Ticket with id " + id + " not found.");
        }

        Ticket ticket = optionalTicket.get();
        TicketStatus newStatus = TicketStatus.valueOf(body.get("status"));
        ticket.setStatus(newStatus);
        ticketRepository.save(ticket);

        return new ResponseEntity<>(ticket, HttpStatus.OK);
    }

    // Delete a ticket (Optional - Student or Admin can delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTicket(@PathVariable Long id) {
        if (!ticketRepository.existsById(id)) {
            throw new TicketNotFoundException("Ticket with id " + id + " not found.");
        }
        ticketRepository.deleteById(id);
        return new ResponseEntity<>("Ticket deleted successfully.", HttpStatus.OK);
    }
}
