package backend.repository;

import backend.model.Technician;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface TechnicianRepository extends JpaRepository<Technician, Long> {
    Optional<Technician> findByEmail(String email);
    List<Technician> findBySpecialization(String specialization);
}
