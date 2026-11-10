package campuscare_backend.service;

import campuscare_backend.entity.PasswordResetOtp;
import campuscare_backend.entity.User;
import campuscare_backend.repository.PasswordResetOtpRepository;
import campuscare_backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetOtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Value("${app.otp.expiry-minutes:5}")
    private int expiryMinutes;

    private final SecureRandom random = new SecureRandom();

    public PasswordResetService(
            UserRepository userRepository,
            PasswordResetOtpRepository otpRepository,
            PasswordEncoder passwordEncoder,
            JavaMailSender mailSender) {

        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }

    public void sendOtp(String email) {

        String normalizedEmail = email.trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("Email is not registered."));

        String otp = String.format("%06d", random.nextInt(1000000));

        otpRepository.findByEmail(normalizedEmail)
                .ifPresent(otpRepository::delete);

        PasswordResetOtp resetOtp = new PasswordResetOtp();
        resetOtp.setEmail(normalizedEmail);
        resetOtp.setOtpHash(passwordEncoder.encode(otp));
        resetOtp.setExpiryTime(LocalDateTime.now().plusMinutes(expiryMinutes));
        resetOtp.setVerified(false);

        otpRepository.saveAndFlush(resetOtp);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("CampusCare - Password Reset OTP");
        message.setText(
                "Hello " + user.getFullName() + ",\n\n" +
                "Your CampusCare password reset OTP is: " + otp +
                "\n\nThis OTP expires in " + expiryMinutes +
                " minutes.\n\nDo not share this OTP with anyone.\n\nCampusCare Team"
        );

        mailSender.send(message);
    }

    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {

        String normalizedEmail = email.trim().toLowerCase();

        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException(
                    "Password must contain at least 8 characters.");
        }

        PasswordResetOtp resetOtp = otpRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("Please request an OTP first."));

        if (resetOtp.getExpiryTime().isBefore(LocalDateTime.now())) {
            otpRepository.delete(resetOtp);
            throw new IllegalArgumentException("OTP has expired. Request a new OTP.");
        }

        if (!passwordEncoder.matches(otp, resetOtp.getOtpHash())) {
            throw new IllegalArgumentException("Invalid OTP.");
        }

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found."));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        otpRepository.delete(resetOtp);
    }
}