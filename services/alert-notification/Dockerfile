# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /build

COPY pom.xml .
COPY api-gateway/pom.xml api-gateway/
COPY telemetry-ingestion/pom.xml telemetry-ingestion/
COPY alert-notification/pom.xml alert-notification/

RUN mvn dependency:go-offline -q

COPY api-gateway/src api-gateway/src
COPY telemetry-ingestion/src telemetry-ingestion/src
COPY alert-notification/src alert-notification/src

RUN mvn clean package -pl alert-notification -am -DskipTests -q

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring

COPY --from=builder /build/alert-notification/target/*.jar app.jar

RUN chown spring:spring app.jar
USER spring

EXPOSE 8082

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8082/api/alerts/status || exit 1

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=70.0", \
  "-jar", "app.jar"]
