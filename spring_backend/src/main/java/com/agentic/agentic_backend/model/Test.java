package com.agentic.agentic_backend.model;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.List;

@Node
public class Test {
    @Id
    private String testId;
    private String name;
    private String result;
    private String date;
    private String status;

    @Relationship(type = "RESULTED_IN")
    private List<ResultedIn> resultedIns;

    // getters and setters
    public String getTestId() {
        return testId;
    }

    public void setTestId(String testId) {
        this.testId = testId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<ResultedIn> getResultedIns() {
        return resultedIns;
    }

    public void setResultedIns(List<ResultedIn> resultedIns) {
        this.resultedIns = resultedIns;
    }
}
