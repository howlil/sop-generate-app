import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingHorizontal: 50,
    fontSize: 10,
    fontFamily: 'Times-Roman',
    lineHeight: 1.4,
  },
  headerWrapper: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    marginBottom: 4,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  instansiText: {
    fontSize: 11,
    textAlign: 'center',
  },
  instansiName: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  instansiSub: {
    fontSize: 10,
    textAlign: 'center',
  },
  headerLine: {
    marginTop: 6,
    borderBottomWidth: 1.5,
    borderColor: '#000',
    width: '100%',
  },
  headerLineThin: {
    marginTop: 1.5,
    borderBottomWidth: 0.5,
    borderColor: '#000',
    width: '100%',
  },
  titleBlock: {
    marginTop: 18,
    marginBottom: 10,
    alignItems: 'center',
  },
  baTitle: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  baSubTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  baNumber: {
    fontSize: 10,
    marginTop: 4,
  },
  paragraph: {
    marginTop: 8,
    textAlign: 'justify',
  },
  infoRow: {
    marginTop: 8,
    flexDirection: 'row',
  },
  infoLabel: {
    width: 90,
  },
  infoColon: {
    width: 10,
  },
  infoValue: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    marginTop: 4,
  },
  listBullet: {
    width: 14,
  },
  listText: {
    flex: 1,
    textAlign: 'justify',
  },
  signatureBlockWrapper: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureCol: {
    width: '45%',
    alignItems: 'center',
  },
  signatureRole: {
    fontSize: 10,
  },
  signatureName: {
    marginTop: 40,
    fontSize: 10,
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
  signatureNip: {
    fontSize: 10,
  },
})

export interface BeritaAcaraPdfProps {
  logoSrc?: string
  pemdaName: string
  instansiLines: string[]
  baTitle?: string
  baSubTitle?: string
  nomorBA: string
  tempat: string
  tanggalDisplay: string
  opd: string
  evaluator: string
  jumlahSOP: number
  uraianTambahan?: string
  pejabatPenandatangan: {
    jabatan: string
    nama: string
    nip?: string
  }
  evaluatorPenandatangan?: {
    jabatan?: string
    nama: string
    nip?: string
  }
}

export const BeritaAcaraPdf: React.FC<BeritaAcaraPdfProps> = (props) => {
  const {
    logoSrc,
    pemdaName,
    instansiLines,
    baTitle = 'BERITA ACARA',
    baSubTitle = 'VERIFIKASI MONITORING DAN EVALUASI STANDAR OPERASIONAL PROSEDUR (SOP)',
    nomorBA,
    tempat,
    tanggalDisplay,
    opd,
    evaluator,
    jumlahSOP,
    uraianTambahan,
    pejabatPenandatangan,
    evaluatorPenandatangan,
  } = props

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerWrapper}>
          <View style={styles.logoRow}>
            {logoSrc ? <Image style={styles.logo} src={logoSrc} /> : null}
            <View>
              <Text style={styles.instansiText}>{pemdaName.toUpperCase()}</Text>
              {instansiLines.map((line, idx) => (
                <Text
                  key={idx}
                  style={idx === 0 ? styles.instansiName : styles.instansiSub}
                >
                  {line.toUpperCase()}
                </Text>
              ))}
              <Text style={styles.instansiSub}>
                ALAMAT: ......................................................
              </Text>
            </View>
          </View>
          <View style={styles.headerLine} />
          <View style={styles.headerLineThin} />
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.baTitle}>{baTitle}</Text>
          <Text style={styles.baSubTitle}>{baSubTitle}</Text>
          <Text style={styles.baNumber}>NOMOR: {nomorBA}</Text>
        </View>

        <Text style={styles.paragraph}>
          Pada hari ini, {tanggalDisplay}, bertempat di {tempat}, kami yang
          bertanda tangan di bawah ini:
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nama OPD</Text>
          <Text style={styles.infoColon}>:</Text>
          <Text style={styles.infoValue}>{opd}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Evaluator</Text>
          <Text style={styles.infoColon}>:</Text>
          <Text style={styles.infoValue}>{evaluator}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Jumlah SOP</Text>
          <Text style={styles.infoColon}>:</Text>
          <Text style={styles.infoValue}>
            {jumlahSOP} ( {jumlahSOP.toString()} ) dokumen
          </Text>
        </View>

        <Text style={styles.paragraph}>
          Telah melakukan kegiatan verifikasi hasil monitoring dan evaluasi
          Standar Operasional Prosedur (SOP) pada perangkat daerah tersebut di
          atas dengan rincian sebagai berikut:
        </Text>

        <View style={styles.listItem}>
          <Text style={styles.listBullet}>1.</Text>
          <Text style={styles.listText}>
            Seluruh dokumen SOP yang diverifikasi telah memenuhi ketentuan
            format dan substansi sesuai dengan pedoman penyusunan SOP yang
            berlaku di lingkungan Pemerintah Daerah.
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>2.</Text>
          <Text style={styles.listText}>
            Hasil verifikasi ini menjadi dasar untuk proses penetapan dan
            pengesahan SOP serta tindak lanjut perbaikan apabila diperlukan.
          </Text>
        </View>
        {uraianTambahan && (
          <View style={styles.listItem}>
            <Text style={styles.listBullet}>3.</Text>
            <Text style={styles.listText}>{uraianTambahan}</Text>
          </View>
        )}

        <Text style={styles.paragraph}>
          Demikian Berita Acara ini dibuat dengan sebenar-benarnya untuk
          dipergunakan sebagaimana mestinya.
        </Text>

        <View style={styles.signatureBlockWrapper}>
          <View style={styles.signatureCol}>
            <Text style={styles.signatureRole}>
              {evaluatorPenandatangan?.jabatan || 'Evaluator'}
            </Text>
            <Text style={styles.signatureRole}>{' '}</Text>
            <Text style={styles.signatureName}>
              {evaluatorPenandatangan?.nama || evaluator}
            </Text>
            {evaluatorPenandatangan?.nip && (
              <Text style={styles.signatureNip}>
                NIP. {evaluatorPenandatangan.nip}
              </Text>
            )}
          </View>

          <View style={styles.signatureCol}>
            <Text style={styles.signatureRole}>{tempat}, {tanggalDisplay}</Text>
            <Text style={styles.signatureRole}>{pejabatPenandatangan.jabatan}</Text>
            <Text style={styles.signatureRole}>{' '}</Text>
            <Text style={styles.signatureName}>{pejabatPenandatangan.nama}</Text>
            {pejabatPenandatangan.nip && (
              <Text style={styles.signatureNip}>
                NIP. {pejabatPenandatangan.nip}
              </Text>
            )}
          </View>
        </View>
      </Page>
    </Document>
  )
}

