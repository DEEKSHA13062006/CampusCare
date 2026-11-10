
package campuscare_backend.service;

import campuscare_backend.entity.User;
import campuscare_backend.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    // STUDENT REGISTRATION
    public User registerUser(User user) {

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException(
                    "Email is already registered!");
        }

        if (userRepository.existsByUsn(user.getUsn())) {
            throw new IllegalArgumentException(
                    "USN is already registered!");
        }

        user.setRole("STUDENT");
        return saveUnverifiedUser(user);
    }

    // FACULTY REGISTRATION
    public User registerFaculty(User user) {

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException(
                    "Email is already registered!");
        }

        if (userRepository.existsByUsn(user.getUsn())) {
            throw new IllegalArgumentException(
                    "Staff ID is already registered!");
        }

        user.setRole("FACULTY");
        return saveUnverifiedUser(user);
    }

    // SAVE USER AND SEND VERIFICATION EMAIL
    private User saveUnverifiedUser(User user) {

        user.setEmail(user.getEmail().trim().toLowerCase());
        user.setUsn(user.getUsn().trim().toUpperCase());

        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        String verificationToken = UUID.randomUUID().toString();

        user.setEmailVerified(false);
        user.setEmailVerificationToken(verificationToken);
        user.setEmailVerificationTokenExpiry(
                LocalDateTime.now().plusHours(24)
        );

        User savedUser = userRepository.save(user);

        emailService.sendVerificationEmail(
                savedUser.getEmail(),
                savedUser.getFullName(),
                verificationToken
        );

        return savedUser;
    }

    // EMAIL VERIFICATION
    public void verifyEmail(String token) {

        User user = userRepository
                .findByEmailVerificationToken(token)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid verification link."
                ));

        if (user.getEmailVerificationTokenExpiry() == null ||
                user.getEmailVerificationTokenExpiry()
                        .isBefore(LocalDateTime.now())) {

            throw new IllegalArgumentException(
                    "Verification link has expired."
            );
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationTokenExpiry(null);

        userRepository.save(user);
    }

    // LOGIN
    public User loginUser(String usn, String rawPassword) {

        String normalizedUsn = usn.trim().toUpperCase();

        User user = userRepository.findByUsn(normalizedUsn)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid ID or password"
                ));

        if (!passwordEncoder.matches(
                rawPassword, user.getPassword())) {

            throw new IllegalArgumentException(
                    "Invalid ID or password"
            );
        }

        if (!user.isEmailVerified()) {
            throw new IllegalArgumentException(
                    "Please verify your email before logging in."
            );
        }

        return user;
    }
}
