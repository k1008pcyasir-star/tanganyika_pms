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
    paddingTop: 24,
    paddingBottom: 24,
    paddingLeft: 20,
    paddingRight: 20,
    fontSize: 11,
    fontFamily: "Times-Roman",
    color: "#000000",
    lineHeight: 1.2,
  },
  header: {
    textAlign: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 13,
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 11,
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
    textDecoration: "underline",
  },
  outerBox: {
    borderWidth: 1,
    borderColor: "#000000",
    marginTop: 6,
  },
  twoCols: {
    flexDirection: "row",
  },
  leftCol: {
    width: "50%",
    borderRightWidth: 1,
    borderRightColor: "#000000",
    padding: 8,
  },
  rightCol: {
    width: "50%",
    padding: 8,
  },
  block: {
    marginBottom: 7,
  },
  blockTitle: {
    fontSize: 10.5,
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  blockValue: {
    fontSize: 10.5,
  },
  officerList: {
    marginTop: 2,
    paddingLeft: 10,
  },
  officerItem: {
    fontSize: 10.5,
    marginBottom: 1,
  },
  dots: {
    fontSize: 10.5,
  },
  signatureWrap: {
    marginTop: 14,
    alignItems: "center",
    textAlign: "center",
  },
  signatureLine: {
    fontSize: 10.5,
  },
  signatureName: {
    marginTop: 6,
    fontSize: 10.5,
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
  },
  signatureTitle: {
    marginTop: 6,
    fontSize: 10.5,
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
  },
});

const sectionOrder = [
  "OFFICE YA TRAFFIC",
  "MADEREVA",
  "CRO SHIFT No. 1",
  "CRO SHIFT No. 2",
  "CRO SHIFT No. 3",
  "CRO SHIFT No. 4",
  "OFFICE YA CID",
  "ULINZI KITUO (06:00HRS-18:00HRS)",
  "ULINZI KITUO (18:00HRS-06:00HRS)",
  "ASKARI WA CRT / MAHAKAMANI",
  "LUHAFWE KWA MCHINA",
  "LINDO KAPUFI MINING",
  "UTAYARI AWAMU YA PILI",
  "ULINZI MAKAZI YA DC TANGANYIKA (06:00HRS-18:00HRS)",
  "LINDO MAKAZI YA DC TANGANYIKA (18:00HRS-06:00HRS)",
  "MAFUNZO DPA",
  "MAFUNZO CHUO CHA POLISI ZANZIBAR",
  "MASOMONI TPS-MOSHI",
  "MASOMONI KIDATU",
  "RUHUSA",
  "MGONJWA KAMBINI",
];

function formatDate(dateStr) {
  if (!dateStr) return "";

  const cleanDate = String(dateStr).split("T")[0];
  const parts = cleanDate.split("-");

  if (parts.length !== 3) return cleanDate;

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function sortSections(sections = []) {
  return [...sections].sort((a, b) => {
    const aIndex = sectionOrder.indexOf(a.name);
    const bIndex = sectionOrder.indexOf(b.name);
    const safeA = aIndex === -1 ? 999 : aIndex;
    const safeB = bIndex === -1 ? 999 : bIndex;
    return safeA - safeB;
  });
}

function renderOfficerLabel(officer) {
  if (typeof officer === "string") return officer;
  return officer?.label || "";
}

function normalizeFixedValue(value) {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    if (value.includes(",")) {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return value.trim() ? [value.trim()] : [];
  }

  return [];
}

function estimateFixedBlockHeight(item) {
  const values = normalizeFixedValue(item.value);
  const itemCount = values.length > 0 ? values.length : 1;
  return 1.8 + itemCount * 0.95;
}

function estimateSectionHeight(section) {
  const officers = section?.officers || [];
  const itemCount = officers.length > 0 ? officers.length : 1;
  return 2 + itemCount * 0.95;
}

function distributeSectionsBalanced(fixedSections = [], activeSections = []) {
  const sortedSections = sortSections(activeSections);

  const leftSections = [];
  const rightSections = [];

  let leftWeight = fixedSections.reduce(
    (sum, item) => sum + estimateFixedBlockHeight(item),
    0
  );
  let rightWeight = 0;

  sortedSections.forEach((section) => {
    const sectionWeight = estimateSectionHeight(section);

    if (leftWeight <= rightWeight) {
      leftSections.push(section);
      leftWeight += sectionWeight;
    } else {
      rightSections.push(section);
      rightWeight += sectionWeight;
    }
  });

  return {
    leftSections,
    rightSections,
  };
}

function FixedBlock({ title, value }) {
  const values = normalizeFixedValue(value);

  return (
    <View style={styles.block} wrap={false}>
      <Text style={styles.blockTitle}>{title}</Text>

      {values.length > 1 ? (
        <View style={styles.officerList}>
          {values.map((item, index) => (
            <Text key={index} style={styles.officerItem}>
              {index + 1}. {item}
            </Text>
          ))}
        </View>
      ) : values.length === 1 ? (
        <Text style={styles.blockValue}>{values[0]}</Text>
      ) : (
        <Text style={styles.dots}>............................</Text>
      )}
    </View>
  );
}

function SectionBlock({ title, officers }) {
  return (
    <View style={styles.block} wrap={false}>
      <Text style={styles.blockTitle}>{title}</Text>

      {officers && officers.length > 0 ? (
        <View style={styles.officerList}>
          {officers.map((officer, index) => (
            <Text key={index} style={styles.officerItem}>
              {index + 1}. {renderOfficerLabel(officer)}
            </Text>
          ))}
        </View>
      ) : (
        <Text style={styles.dots}>............................</Text>
      )}
    </View>
  );
}

function MainSchedulePDF({
  scheduleTitle = "MPANGO KAZI WA KITUO CHA POLISI TANGANYIKA",
  dateFrom = "",
  dateTo = "",
  fixedSections = [],
  activeSections = [],
  signatureName = "N. P KIBIRITI",
  signatureRank = "SP",
  signatureTitle = "MKUU WA KITUO CHA POLISI TANGANYIKA",
}) {
  const { leftSections, rightSections } = distributeSectionsBalanced(
    fixedSections,
    activeSections
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header} wrap={false}>
          <Text style={styles.title}>{scheduleTitle}</Text>
          <Text style={styles.subtitle}>
            JUMATATU YA TAREHE {formatDate(dateFrom)} HADI TAREHE {formatDate(dateTo)}
          </Text>
        </View>

        <View style={styles.outerBox}>
          <View style={styles.twoCols}>
            <View style={styles.leftCol}>
              {fixedSections.map((item, index) => (
                <FixedBlock
                  key={item.key || `${item.title}-${index}`}
                  title={item.title}
                  value={item.value}
                />
              ))}

              {leftSections.map((section, index) => (
                <SectionBlock
                  key={section.id || `${section.name}-${index}`}
                  title={section.name}
                  officers={section.officers || []}
                />
              ))}
            </View>

            <View style={styles.rightCol}>
              {rightSections.map((section, index) => (
                <SectionBlock
                  key={section.id || `${section.name}-${index}`}
                  title={section.name}
                  officers={section.officers || []}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.signatureWrap} wrap={false}>
          <Text style={styles.signatureLine}>....................................</Text>
          <Text style={styles.signatureName}>
            ({signatureName} - {signatureRank})
          </Text>
          <Text style={styles.signatureTitle}>{signatureTitle}</Text>
        </View>
      </Page>
    </Document>
  );
}

export default MainSchedulePDF;