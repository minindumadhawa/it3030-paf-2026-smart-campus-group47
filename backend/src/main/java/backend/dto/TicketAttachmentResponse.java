package backend.dto;

public class TicketAttachmentResponse {
    private Long id;
    private String fileName;
    private String fileType;
    private String url;

    public TicketAttachmentResponse() {}

    public TicketAttachmentResponse(Long id, String fileName, String fileType, String url) {
        this.id = id;
        this.fileName = fileName;
        this.fileType = fileType;
        this.url = url;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
}
