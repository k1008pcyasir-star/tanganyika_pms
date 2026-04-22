import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingLeft: 24,
    paddingRight: 24,
    fontSize: 11,
    fontFamily: "Times-Roman",
    color: "#000000",
    lineHeight: 1.25,
  },
  header: {
    textAlign: "left",
    marginBottom: 12,
  },
  title: {
    fontSize: 13,
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
    textDecoration: "underline",
    lineHeight: 1.3,
  },
  subTitleLine: {
    marginTop: 6,
    fontSize: 11,
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
  },
  timeLine: {
    marginTop: 4,
    fontSize: 11,
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
  },
  infoBlock: {
    marginTop: 8,
    marginBottom: 10,
  },
  infoLine: {
    fontSize: 11,
    marginBottom: 4,
  },
  bulletWrap: {
    marginBottom: 4,
  },
  listWrap: {
    marginTop: 8,
    marginBottom: 20,
  },
  listItem: {
    fontSize: 11,
    marginBottom: 4,
  },
  signatureWrap: {
    marginTop: 50,
    alignItems: "center",
    textAlign: "center",
  },
  signatureLine: {
    fontSize: 11,
  },
  signatureName: {
    marginTop: 6,
    fontSize: 11,
    fontFamily: "Times-Bold",
  },
  signatureTitle: {
    marginTop: 2,
    fontSize: 11,
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
  },
});

function formatDate(dateStr) {
  if (!dateStr) return "";

  const cleanDate = String(dateStr).split("T")[0];
  const parts = cleanDate.split("-");

  if (parts.length !== 3) return cleanDate;

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatPatrolTime(value) {
  if (!value) return "";

  return String(value)
    .replace(/\s*HRS\s*/gi, "")
    .replace(/\s*-\s*/g, "-")
    .trim();
}

function renderOfficerLabel(officer) {
  if (typeof officer === "string") return officer;
  return officer?.label || "";
}

function PatrolSchedulePDF({
  title = "MPANGO KAZI WA MAOFISA WA ZAMU NA DORIA",
  date = "",
  patrolTime = "",
  zamuOfficer = "",
  zamuOfficerPhone = "",
  inspectorOfficer = "",
  inspectorOfficerPhone = "",
  patrolOfficers = [],
  signatureName = "",
  signatureTitle = "MKUU WA KITUO CHA POLISI TANGANYIKA",
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>

          {date ? (
            <Text style={styles.subTitleLine}>
              LEO TAREHE {formatDate(date)}
            </Text>
          ) : null}

          {patrolTime ? (
            <Text style={styles.timeLine}>
              SAA {formatPatrolTime(patrolTime)}
            </Text>
          ) : null}
        </View>

        <View style={styles.infoBlock}>
          <View style={styles.bulletWrap}>
            <Text style={styles.infoLine}>
              • AFISA WA ZAMU - {zamuOfficer || "........................"}
              {zamuOfficerPhone ? ` - SIMU NO ${zamuOfficerPhone}` : ""}
            </Text>
          </View>

          <View style={styles.bulletWrap}>
            <Text style={styles.infoLine}>
              • MKAAGUZI WA ZAMU - {inspectorOfficer || "........................"}
              {inspectorOfficerPhone ? ` - SIMU NO ${inspectorOfficerPhone}` : ""}
            </Text>
          </View>
        </View>

        <View style={styles.listWrap}>
          {patrolOfficers.length > 0 ? (
            patrolOfficers.map((officer, index) => (
              <Text key={index} style={styles.listItem}>
                {index + 1}. {renderOfficerLabel(officer)}
              </Text>
            ))
          ) : (
            <>
              <Text style={styles.listItem}>1. ........................</Text>
              <Text style={styles.listItem}>2. ........................</Text>
              <Text style={styles.listItem}>3. ........................</Text>
            </>
          )}
        </View>

        <View style={styles.signatureWrap}>
          <Text style={styles.signatureLine}>....................................</Text>
          <Text style={styles.signatureName}>
            {signatureName || "........................"}
          </Text>
          <Text style={styles.signatureTitle}>{signatureTitle}</Text>
        </View>
      </Page>
    </Document>
  );
}

export default PatrolSchedulePDF;