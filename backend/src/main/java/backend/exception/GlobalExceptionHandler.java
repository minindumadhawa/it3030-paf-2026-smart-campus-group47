package backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    // Helper to build error map
    private Map<String, String> buildError(String message) {
        Map<String, String> response = new HashMap<>();
        response.put("error", message);
        return response;
    }

    @ExceptionHandler(TicketNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(TicketNotFoundException ex) {
        return new ResponseEntity<>(buildError(ex.getMessage()), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Map<String, String>> handleUnauthorized(UnauthorizedException ex) {
        return new ResponseEntity<>(buildError(ex.getMessage()), HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<Map<String, String>> handleValidation(ValidationException ex) {
        return new ResponseEntity<>(buildError(ex.getMessage()), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        return new ResponseEntity<>(buildError(ex.getMessage()), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleUserExists(UserAlreadyExistsException ex) {
        return new ResponseEntity<>(buildError(ex.getMessage()), HttpStatus.CONFLICT);
    }

    // Generic fallback for any other unexpected errors
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneric(Exception ex) {
        return new ResponseEntity<>(buildError("An unexpected error occurred."), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
