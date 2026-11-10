
package campuscare_backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(
            String recipientEmail,
            String fullName,
            String token) {

        String verificationLink =
                frontendUrl + "/verify-email?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(senderEmail);
        message.setTo(recipientEmail);
        message.setSubject("Verify Your CampusCare Email Address");

        message.setText(
                "Hello " + fullName + ",\n\n" +
                "Welcome to CampusCare!\n\n" +
                "Please verify your email address by clicking the link below:\n\n" +
                verificationLink + "\n\n" +
                "This verification link expires in 24 hours.\n\n" +
                "If you did not create a CampusCare account, please ignore this email.\n\n" +
                "Regards,\nCampusCare Team"
        );

        mailSender.send(message);
    }
}
