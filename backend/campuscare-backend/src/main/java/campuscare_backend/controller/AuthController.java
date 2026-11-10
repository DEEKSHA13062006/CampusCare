
package campuscare_backend.controller;

import campuscare_backend.dto.RegisterRequest;
import campuscare_backend.dto.LoginRequest;
import campuscare_backend.dto.ForgotPasswordRequest;
import campuscare_backend.dto.ResetPasswordRequest;

import campuscare_backend.entity.User;
import campuscare_backend.service.UserService;
import campuscare_backend.service.PasswordResetService;
import campuscare_backend.security.JwtService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;
    private final PasswordResetService passwordResetService;

    public AuthController(
            UserService userService,
            JwtService jwtService,
            PasswordResetService passwordResetService) {

        this.userService = userService;
        this.jwtService = jwtService;
        this.passwordResetService = passwordResetService;
    }

    // STUDENT REGISTRATION
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(
            @Valid @RequestBody RegisterRequest request) {

        try {
            User user = new User();

            user.setFullName(request.getFullName());
            user.setEmail(request.getEmail());
            user.setUsn(request.getUsn());
            user.setPassword(request.getPassword());
            user.setRole("STUDENT");

            User savedUser = userService.registerUser(user);

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    Map.of(
                            "message", "Student registration successful!",
                            "id", savedUser.getId(),
                            "fullName", savedUser.getFullName(),
                            "email", savedUser.getEmail(),
                            "usn", savedUser.getUsn(),
                            "role", savedUser.getRole()
                    )
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    // FACULTY REGISTRATION
    @PostMapping("/register-faculty")
    public ResponseEntity<?> registerFaculty(
            @Valid @RequestBody RegisterRequest request) {

        try {
            User user = new User();

            user.setFullName(request.getFullName());
            user.setEmail(request.getEmail());
            user.setUsn(request.getUsn());
            user.setPassword(request.getPassword());

            User savedUser = userService.registerFaculty(user);

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    Map.of(
                            "message", "Faculty registration successful!",
                            "id", savedUser.getId(),
                            "fullName", savedUser.getFullName(),
                            "email", savedUser.getEmail(),
                            "usn", savedUser.getUsn(),
                            "role", savedUser.getRole()
                    )
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }
// VERIFY EMAIL
@GetMapping("/verify-email")
public ResponseEntity<?> verifyEmail(
        @RequestParam String token) {

    try {
        userService.verifyEmail(token);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Email verified successfully! You can now log in."
                )
        );

    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(
                Map.of("message", e.getMessage())
        );
    }
}
    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(
            @Valid @RequestBody LoginRequest request) {

        try {
            User user = userService.loginUser(
                    request.getUsn(),
                    request.getPassword()
            );

            String token = jwtService.generateToken(user.getEmail());

            return ResponseEntity.ok(
                    Map.of(
                            "message", "Login successful!",
                            "token", token,
                            "id", user.getId(),
                            "fullName", user.getFullName(),
                            "email", user.getEmail(),
                            "usn", user.getUsn(),
                            "role", user.getRole()
                    )
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    // FORGOT PASSWORD
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        try {
            passwordResetService.sendOtp(request.getEmail());

            return ResponseEntity.ok(
                    Map.of("message", "OTP sent successfully.")
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("message", "Unable to send OTP.")
            );
        }
    }

    // RESET PASSWORD
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        try {
            passwordResetService.resetPassword(
                    request.getEmail(),
                    request.getOtp(),
                    request.getNewPassword()
            );

            return ResponseEntity.ok(
                    Map.of("message", "Password reset successfully.")
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }
}
