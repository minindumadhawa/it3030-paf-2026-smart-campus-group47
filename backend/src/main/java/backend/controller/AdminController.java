package backend.controller;

import backend.exception.UserAlreadyExistsException;
import backend.model.Admin;
import backend.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/admins")
@CrossOrigin(origins = "http://localhost:3000") // Enable CORS for React frontend
public class AdminController {

    @Autowired
    private AdminRepository adminRepository;

    @PostMapping("/register")
    public ResponseEntity<Admin> registerAdmin(@RequestBody Admin admin) {
        Optional<Admin> existingAdmin = adminRepository.findByEmail(admin.getEmail());
        if (existingAdmin.isPresent()) {
            throw new UserAlreadyExistsException("Admin with email " + admin.getEmail() + " already exists.");
        }
        Admin savedAdmin = adminRepository.save(admin);
        return new ResponseEntity<>(savedAdmin, HttpStatus.CREATED);
    }
}
