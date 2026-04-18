package backend.controller;

import backend.dto.*;
import backend.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import backend.service.NotificationService;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:3000")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @Autowired
    private backend.service.AttachmentService attachmentService;

    // ADDED - NotificationService inject
    @Autowired
    private NotificationService notificationService;

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(@RequestBody TicketRequest request) {
        return new ResponseEntity<>(ticketService.createTicket(request), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/attachments")
    public ResponseEntity<List<TicketAttachmentResponse>> uploadAttachments(
            @PathVariable Long id,
            @RequestParam("files") List<org.springframework.web.multipart.MultipartFile> files) throws java.io.IOException {
        
        List<backend.model.TicketAttachment> attachments = attachmentService.saveAttachments(id, files);
        List<TicketAttachmentResponse> response = attachments.stream()
                .map(a -> new TicketAttachmentResponse(a.getId(), a.getFileName(), a.getFileType(), "/api/uploads/tickets/" + a.getFilePath()))
                .toList();
        
        return ResponseEntity.ok(response);
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
        TicketResponse response = ticketService.updateStatus(id, request);
        // ✅ ADDED - Ticket status change වෙලාවට notification
        notificationService.createNotification(
                response.getUserId(),
                "Your ticket for '" + response.getLocationOrResource() + "' status changed to " + response.getStatus(),
                "TICKET_UPDATE"
        );

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/resolution")
    public ResponseEntity<TicketResponse> updateResolution(@PathVariable Long id, @RequestBody TicketResolutionRequest request) {
        return ResponseEntity.ok(ticketService.updateResolution(id, request));
    }
}
