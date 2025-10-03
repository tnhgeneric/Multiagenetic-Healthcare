package com.agentic.agentic_backend.model;

import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.TargetNode;

@RelationshipProperties
public class UnderwentTest {
    @Id
    @GeneratedValue
    private Long id;
    private String performedDate;
    @TargetNode
    private Test test;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPerformedDate() {
        return performedDate;
    }

    public void setPerformedDate(String performedDate) {
        this.performedDate = performedDate;
    }

    public Test getTest() {
        return test;
    }

    public void setTest(Test test) {
        this.test = test;
    }
}
