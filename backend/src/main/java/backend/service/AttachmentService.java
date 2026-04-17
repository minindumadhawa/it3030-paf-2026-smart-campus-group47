package backend.service;

import backend.model.Ticket;
import backend.model.TicketAttachment;
import backend.repository.TicketAttachmentRepository;
import backend.repository.TicketRepository;
import backend.exception.TicketNotFoundException;
import backend.exception.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class AttachmentService {

    private final String uploadDir = "uploads/tickets/";

    @Autowired
    private TicketAttachmentRepository attachmentRepository;

    @Autowired
    private TicketRepository ticketRepository;

    public List<TicketAttachment> saveAttachments(Long ticketId, List<MultipartFile> files) throws IOException {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + ticketId));

        // Validation for max 3 images (total)
        long currentCount = attachmentRepository.findByTicketId(ticketId).size();
        if (currentCount + files.size() > 3) {
            throw new ValidationException("Maximum 3 attachments allowed per ticket.");
        }

        List<TicketAttachment> savedAttachments = new ArrayList<>();
        
        // Ensure directory exists
        Path path = Paths.get(uploadDir);
        if (!Files.exists(path)) {
            Files.createDirectories(path);
        }

        for (MultipartFile file : files) {
            String originalName = file.getOriginalFilename();
            String extension = originalName.substring(originalName.lastIndexOf("."));
            String uniqueName = UUID.randomUUID().toString() + extension;
            
            Path targetLocation = path.resolve(uniqueName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            TicketAttachment attachment = new TicketAttachment(
                originalName,
                file.getContentType(),
                uniqueName, // Store the unique name as the path reference
                ticket
            );
            
            savedAttachments.add(attachmentRepository.save(attachment));
        }

        return savedAttachments;
    }

    public List<TicketAttachment> getAttachmentsByTicket(Long ticketId) {
        return attachmentRepository.findByTicketId(ticketId);
    }
}
