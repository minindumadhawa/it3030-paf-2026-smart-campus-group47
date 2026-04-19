package backend.controller;

import backend.model.Resource;
import backend.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "http://localhost:3000")
public class ResourceController {

    @Autowired
    private ResourceRepository resourceRepository;

    @GetMapping
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Resource> createResource(@RequestBody Resource resource) {
        Resource saved = resourceRepository.save(resource);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(@PathVariable Long id, @RequestBody Resource details) {
        Optional<Resource> optionalResource = resourceRepository.findById(id);
        if (optionalResource.isPresent()) {
            Resource resource = optionalResource.get();
            resource.setName(details.getName());
            resource.setType(details.getType());
            resource.setCapacity(details.getCapacity());
            resource.setLocation(details.getLocation());
            resource.setAvailabilityWindows(details.getAvailabilityWindows());
            resource.setStatus(details.getStatus());
            resource.setImageUrl(details.getImageUrl());
            return new ResponseEntity<>(resourceRepository.save(resource), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping("/upload-image")
    public ResponseEntity<java.util.Map<String, String>> uploadImage(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            String uploadDir = "uploads/resources/";
            java.nio.file.Path path = java.nio.file.Paths.get(uploadDir);
            if (!java.nio.file.Files.exists(path)) {
                java.nio.file.Files.createDirectories(path);
            }
            
            String originalName = file.getOriginalFilename();
            String extension = originalName != null && originalName.contains(".") ? originalName.substring(originalName.lastIndexOf(".")) : "";
            String uniqueName = java.util.UUID.randomUUID().toString() + extension;
            
            java.nio.file.Path targetLocation = path.resolve(uniqueName);
            java.nio.file.Files.copy(file.getInputStream(), targetLocation, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            
            String fileUrl = "/api/uploads/resources/" + uniqueName;
            
            java.util.Map<String, String> response = new java.util.HashMap<>();
            response.put("url", fileUrl);
            return ResponseEntity.ok(response);
        } catch (java.io.IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceRepository.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
