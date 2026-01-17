package com.alphamath.portfolio.application.audit;

import com.alphamath.portfolio.domain.audit.AuditEvent;
import com.alphamath.portfolio.infrastructure.persistence.AuditEventEntity;
import com.alphamath.portfolio.infrastructure.persistence.AuditEventRepository;
import com.alphamath.portfolio.infrastructure.persistence.JsonUtils;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AuditService {
  private final AuditEventRepository events;

  public AuditService(AuditEventRepository events) {
    this.events = events;
  }

  public void record(String userId, String actor, String eventType, String entityType, String entityId,
                     Map<String, Object> metadata) {
    AuditEventEntity entity = new AuditEventEntity();
    entity.setId(UUID.randomUUID().toString());
    entity.setUserId(userId);
    entity.setActor(actor == null || actor.isBlank() ? "system" : actor);
    entity.setEventType(eventType);
    entity.setEntityType(entityType);
    entity.setEntityId(entityId);
    entity.setCreatedAt(Instant.now());
    entity.setMetadataJson(JsonUtils.toJson(metadata == null ? Map.of() : metadata));
    events.save(entity);
  }

  public List<AuditEvent> list(String userId, String eventType, String entityId, int limit) {
    int size = limit <= 0 ? 50 : Math.min(limit, 200);
    var page = PageRequest.of(0, size);

    List<AuditEventEntity> rows;
    if (eventType != null && !eventType.isBlank()) {
      rows = events.findByUserIdAndEventTypeOrderByCreatedAtDesc(userId, eventType.trim(), page);
    } else if (entityId != null && !entityId.isBlank()) {
      rows = events.findByUserIdAndEntityIdOrderByCreatedAtDesc(userId, entityId.trim(), page);
    } else {
      rows = events.findByUserIdOrderByCreatedAtDesc(userId, page);
    }
    return rows.stream().map(this::toDto).toList();
  }

  public String exportCsv(String userId, String eventType, String entityId, int limit) {
    List<AuditEvent> rows = list(userId, eventType, entityId, limit);
    StringBuilder sb = new StringBuilder();
    sb.append("id,actor,eventType,entityType,entityId,createdAt,metadata").append("\n");
    for (AuditEvent event : rows) {
      sb.append(escape(event.getId())).append(',')
        .append(escape(event.getActor())).append(',')
        .append(escape(event.getEventType())).append(',')
        .append(escape(event.getEntityType())).append(',')
        .append(escape(event.getEntityId())).append(',')
        .append(escape(event.getCreatedAt() == null ? null : event.getCreatedAt().toString())).append(',')
        .append(escape(JsonUtils.toJson(event.getMetadata())))
        .append("\n");
    }
    return sb.toString();
  }

  private String escape(String value) {
    if (value == null) return "";
    String escaped = value.replace("\"", "\"\"");
    return "\"" + escaped + "\"";
  }

  private AuditEvent toDto(AuditEventEntity entity) {
    AuditEvent out = new AuditEvent();
    out.setId(entity.getId());
    out.setUserId(entity.getUserId());
    out.setActor(entity.getActor());
    out.setEventType(entity.getEventType());
    out.setEntityType(entity.getEntityType());
    out.setEntityId(entity.getEntityId());
    out.setCreatedAt(entity.getCreatedAt());
    out.setMetadata(parseMetadata(entity.getMetadataJson()));
    return out;
  }

  private Map<String, Object> parseMetadata(String json) {
    if (json == null || json.isBlank()) {
      return new LinkedHashMap<>();
    }
    try {
      return JsonUtils.fromJson(json, new TypeReference<Map<String, Object>>() {});
    } catch (Exception e) {
      return new LinkedHashMap<>();
    }
  }
}
