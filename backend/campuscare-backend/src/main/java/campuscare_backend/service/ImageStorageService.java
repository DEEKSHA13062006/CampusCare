
package campuscare_backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Service
public class ImageStorageService {

    private final Path uploadDirectory =
            Paths.get("uploads").toAbsolutePath().normalize();

    private static final Set<String> ALLOWED_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp");

    public ImageStorageService() throws IOException {
        Files.createDirectories(uploadDirectory);
    }

    public String storeImage(MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please select an image.");
        }

        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException(
                    "Only JPG, PNG and WEBP images are allowed.");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException(
                    "Image size must not exceed 5 MB.");
        }

        String extension = switch (file.getContentType()) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> throw new IllegalArgumentException(
                    "Unsupported image format.");
        };

        String fileName = UUID.randomUUID() + extension;

        Path targetPath = uploadDirectory.resolve(fileName).normalize();

        if (!targetPath.startsWith(uploadDirectory)) {
            throw new IllegalArgumentException("Invalid file path.");
        }

        Files.copy(file.getInputStream(), targetPath);

        return fileName;
    }

    public Path getImagePath(String fileName) throws IOException {

        if (fileName == null ||
                !fileName.matches("[a-fA-F0-9-]+\\.(jpg|png|webp)")) {
            throw new IllegalArgumentException("Invalid image filename.");
        }

        Path imagePath = uploadDirectory.resolve(fileName).normalize();

        if (!imagePath.startsWith(uploadDirectory)
                || !Files.exists(imagePath)
                || !Files.isRegularFile(imagePath)) {
            throw new IOException("Image not found.");
        }

        return imagePath;
    }
}
