package backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class BackendApplication implements WebMvcConfigurer {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		exposeDirectory("uploads/tickets", registry);
	}

	private void exposeDirectory(String dirName, ResourceHandlerRegistry registry) {
		Path uploadDir = Paths.get(dirName);
		
		registry.addResourceHandler("/api/uploads/tickets/**")
				.addResourceLocations(uploadDir.toUri().toString());
	}

	@Bean
	CommandLineRunner cleanOrphanedTestData(JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				// Safely delete bookings linked to the test resource to clear foreign key constraints
				jdbcTemplate.execute("DELETE FROM bookings WHERE resource_id IN (SELECT id FROM resources WHERE name = 'Test Lecture Hall')");
				// Safely delete the test resource itself
				jdbcTemplate.execute("DELETE FROM resources WHERE name = 'Test Lecture Hall'");
				System.out.println("Test Lecture Hall and its bindings have been successfully cleaned up via SQL.");
			} catch (Exception e) {
				System.out.println("Could not clean test data (tables might not exist yet): " + e.getMessage());
			}
		};
	}
}

