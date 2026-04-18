package backend.controller;

import backend.exception.UserAlreadyExistsException;
import backend.model.Technician;
import backend.repository.TechnicianRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/technicians")
@CrossOrigin(origins = "http://localhost:3000")
public class TechnicianController {

    @Autowired
    private TechnicianRepository technicianRepository;

    @PostMapping("/register")
    public ResponseEntity<Technician> registerTechnician(@RequestBody Technician technician) {
        Optional<Technician> existing = technicianRepository.findByEmail(technician.getEmail());
        if (existing.isPresent()) {
            throw new UserAlreadyExistsException("Technician with email " + technician.getEmail() + " already exists.");
        }
        Technician saved = technicianRepository.save(technician);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Technician>> getAllTechnicians(@RequestParam(required = false) String specialization) {
        if (specialization != null && !specialization.equals("ALL")) {
            return ResponseEntity.ok(technicianRepository.findBySpecialization(specialization));
        }
        return ResponseEntity.ok(technicianRepository.findAll());
    }
}
