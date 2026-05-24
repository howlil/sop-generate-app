import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PdfSignatureChecksDto {
  @ApiProperty()
  readonly digestMatch!: boolean;

  @ApiProperty()
  readonly chainTrusted!: boolean;

  @ApiProperty()
  readonly certificatePeriodValid!: boolean;
}

export class PdfSignatureCertificateDto {
  @ApiProperty()
  readonly validFrom!: string;

  @ApiProperty()
  readonly validTo!: string;

  @ApiProperty()
  readonly fingerprint!: string;

  @ApiProperty()
  readonly serialNumber!: string;
}

export class PdfSignatureVerificationEntryDto {
  @ApiProperty()
  readonly index!: number;

  @ApiProperty()
  readonly valid!: boolean;

  @ApiProperty()
  readonly reason!: string;

  @ApiProperty()
  readonly signerSubject!: string;

  @ApiProperty()
  readonly signerIssuer!: string;

  @ApiPropertyOptional({ nullable: true })
  readonly signedAt!: string | null;

  @ApiProperty({ type: () => PdfSignatureCertificateDto })
  readonly certificate!: PdfSignatureCertificateDto;

  @ApiProperty({ type: () => PdfSignatureChecksDto })
  readonly checks!: PdfSignatureChecksDto;
}

export class VerifyPdfResponseDto {
  @ApiProperty()
  readonly pdfSigningEnabled!: boolean;

  @ApiPropertyOptional({ nullable: true })
  readonly trustedCaSubject!: string | null;

  @ApiProperty()
  readonly hasSignatures!: boolean;

  @ApiProperty()
  readonly allValid!: boolean;

  @ApiProperty({ type: () => [PdfSignatureVerificationEntryDto] })
  readonly signatures!: PdfSignatureVerificationEntryDto[];

  @ApiProperty()
  readonly disclaimer!: string;
}
