package backend.service;

import backend.dto.BookingRequest;
import backend.dto.BookingResponse;
import backend.model.Booking;
import backend.model.BookingStatus;
import backend.model.Resource;
import backend.model.User;
import backend.repository.BookingRepository;
import backend.repository.ResourceRepository;
import backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    public BookingResponse createBooking(BookingRequest request) {
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if(request.getEndTime().isBefore(request.getStartTime()) || request.getEndTime().equals(request.getStartTime())) {
            throw new RuntimeException("End time must be strictly after start time.");
        }

        List<BookingStatus> blockingStatuses = Arrays.asList(BookingStatus.PENDING, BookingStatus.APPROVED);
        List<Booking> overlapping = bookingRepository.findOverlappingBookings(
                resource.getId(), request.getBookingDate(), request.getStartTime(), request.getEndTime(), blockingStatuses);

        if (!overlapping.isEmpty()) {
            throw new RuntimeException("Resource is already booked/pending for the requested time slots.");
        }

        Booking booking = new Booking();
        booking.setResource(resource);
        booking.setUser(user);
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);

        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }

    public BookingResponse updateBookingStatus(Long id, BookingStatus newStatus, String adminReason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        booking.setStatus(newStatus);
        if (adminReason != null && !adminReason.isEmpty()) {
            booking.setAdminReason(adminReason);
        }
        
        Booking saved = bookingRepository.save(booking);
        
        // Send notification based on the new status
        if (newStatus == BookingStatus.APPROVED) {
            notificationService.sendBookingApprovalNotification(saved.getUser().getId(), saved.getId());
        } else if (newStatus == BookingStatus.REJECTED) {
            notificationService.sendBookingRejectionNotification(saved.getUser().getId(), saved.getId(), adminReason != null ? adminReason : "No reason provided");
        }
        
        return mapToResponse(saved);
    }

    public List<BookingResponse> getBookingsByUserId(Long userId) {
        List<Booking> bookings = bookingRepository.findByUserId(userId);
        return bookings.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public void cancelBooking(Long id, Long userId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
                
        if(!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only cancel your own bookings");
        }
        
        if(booking.getStatus() == BookingStatus.REJECTED || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking is already resolved or cancelled");
        }
        
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    private BookingResponse mapToResponse(Booking booking) {
        BookingResponse res = new BookingResponse();
        res.setId(booking.getId());
        res.setResourceId(booking.getResource().getId());
        res.setResourceName(booking.getResource().getName());
        res.setResourceType(booking.getResource().getType());
        res.setUserId(booking.getUser().getId());
        res.setUserName(booking.getUser().getFullName());
        res.setBookingDate(booking.getBookingDate());
        res.setStartTime(booking.getStartTime());
        res.setEndTime(booking.getEndTime());
        res.setPurpose(booking.getPurpose());
        res.setExpectedAttendees(booking.getExpectedAttendees());
        res.setStatus(booking.getStatus());
        res.setAdminReason(booking.getAdminReason());
        return res;
    }
}
