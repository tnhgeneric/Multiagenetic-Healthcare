package com.agentic.agentic_backend.model;

public class TestMapper {
    public static TestDTO toDTO(Test test) {
        if (test == null)
            return null;
        TestDTO dto = new TestDTO();
        dto.setTestId(test.getTestId());
        dto.setName(test.getName());
        dto.setResult(test.getResult());
        dto.setDate(test.getDate());
        dto.setStatus(test.getStatus());
        // Add more fields as needed
        return dto;
    }
}
