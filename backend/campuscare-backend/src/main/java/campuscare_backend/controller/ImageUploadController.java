
package campuscare_backend.controller;

import campuscare_backend.service.ImageStorageService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/uploads")
@CrossOrigin(origins = "http://localhost:5173")
public class ImageUploadController {

    private final ImageStorageService imageStorageService;

    public ImageUploadController(
            ImageStorageService imageStorageService) {
        this.imageStorageService = imageStorageService;
    }

    @PostMapping("/image")
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestParam("file") MultipartFile file) throws IOException {

        String fileName = imageStorageService.storeImage(file);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "message", "Image uploaded successfully",
                        "imagePath", fileName
                ));
    }
}
