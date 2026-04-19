package backend.controller;

import backend.exception.UserAlreadyExistsException;
import backend.model.LoginRequest;
import backend.model.User;
import backend.model.Admin;
import backend.repository.UserRepository;
import backend.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000") // Enable CORS for React frontend
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private backend.repository.TechnicianRepository technicianRepository;

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody User user) {
        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            throw new UserAlreadyExistsException("User with email " + user.getEmail() + " already exists.");
        }
        
        User savedUser = userRepository.save(user);
        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        // First check if the email belongs to an Admin
        Optional<Admin> adminOptional = adminRepository.findByEmail(loginRequest.getEmail());
        if (adminOptional.isPresent()) {
            Admin existingAdmin = adminOptional.get();
            if (existingAdmin.getPassword().equals(loginRequest.getPassword())) {
                Map<String, Object> response = new HashMap<>();
                response.put("id", existingAdmin.getId());
                response.put("fullName", existingAdmin.getFullName());
                response.put("email", existingAdmin.getEmail());
                response.put("role", "ADMIN");
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid password");
                return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
            }
        }

        // Then check if the email belongs to a User
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());
        if (userOptional.isPresent()) {
            User existingUser = userOptional.get();
            if (existingUser.getPassword().equals(loginRequest.getPassword())) {
                Map<String, Object> response = new HashMap<>();
                response.put("id", existingUser.getId());
                response.put("fullName", existingUser.getFullName());
                response.put("email", existingUser.getEmail());
                response.put("role", "USER");
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid password");
                return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
            }
        }

        // Finally check if the email belongs to a Technician
        Optional<backend.model.Technician> technicianOptional = technicianRepository.findByEmail(loginRequest.getEmail());
        if (technicianOptional.isPresent()) {
            backend.model.Technician existingTech = technicianOptional.get();
            if (existingTech.getPassword().equals(loginRequest.getPassword())) {
                Map<String, Object> response = new HashMap<>();
                response.put("id", existingTech.getId());
                response.put("fullName", existingTech.getFullName());
                response.put("email", existingTech.getEmail());
                response.put("specialization", existingTech.getSpecialization());
                response.put("role", "TECHNICIAN");
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid password");
                return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
            }
        }

        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", "Access denied. Account not found.");
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String fullName = payload.get("fullName");

        if (email == null || email.isEmpty()) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Email is required for Google Login.");
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }

        // First check if the email belongs to an Admin
        Optional<Admin> adminOptional = adminRepository.findByEmail(email);
        if (adminOptional.isPresent()) {
            Admin existingAdmin = adminOptional.get();
            Map<String, Object> response = new HashMap<>();
            response.put("id", existingAdmin.getId());
            response.put("fullName", existingAdmin.getFullName());
            response.put("email", existingAdmin.getEmail());
            response.put("role", "ADMIN");
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        // Finally check if the email belongs to a Technician
        Optional<backend.model.Technician> technicianOptional = technicianRepository.findByEmail(email);
        if (technicianOptional.isPresent()) {
            backend.model.Technician existingTech = technicianOptional.get();
            Map<String, Object> response = new HashMap<>();
            response.put("id", existingTech.getId());
            response.put("fullName", existingTech.getFullName());
            response.put("email", existingTech.getEmail());
            response.put("specialization", existingTech.getSpecialization());
            response.put("role", "TECHNICIAN");
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        // Then check if the email belongs to a User
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            User existingUser = userOptional.get();
            Map<String, Object> response = new HashMap<>();
            response.put("id", existingUser.getId());
            response.put("fullName", existingUser.getFullName());
            response.put("email", existingUser.getEmail());
            response.put("role", "USER");
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        // If not found, create a new User automatically for Google Auth
        User newUser = new User();
        newUser.setEmail(email);
        newUser.setFullName(fullName != null && !fullName.isEmpty() ? fullName : email.substring(0, email.indexOf("@")));
        newUser.setPassword(java.util.UUID.randomUUID().toString()); // strong random password

        User savedUser = userRepository.save(newUser);

        Map<String, Object> response = new HashMap<>();
        response.put("id", savedUser.getId());
        response.put("fullName", savedUser.getFullName());
        response.put("email", savedUser.getEmail());
        response.put("role", "USER");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
