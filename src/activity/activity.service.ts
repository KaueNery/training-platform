import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Express } from 'express';
import FitParser from 'fit-file-parser';

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async parseAndSaveActivity(file: Express.Multer.File, userId: number) {
    const fitParser = new FitParser({
      force: true,
      speedUnit: 'm/s',
      lengthUnit: 'm',
      temperatureUnit: 'celsius',
      elapsedRecordField: true,
      mode: 'list',
    });

    const parsedData = await new Promise<any>((resolve, reject) => {
      fitParser.parse(file.buffer, (error, data) => {
        if (error) return reject(error);
        resolve(data);
      });
    });

    const activityData = this.extractActivityData(parsedData, userId);

    const savedActivity = await this.prisma.activity.create({
      data: activityData,
    });

    return savedActivity;
  }

  private extractActivityData(parsedData: any, userId: number): Prisma.ActivityCreateInput {
    const session = parsedData.activitySessions?.[0] || parsedData.sessions?.[0] || {};
    const records = parsedData.records || [];

    const lastRecord = records[records.length - 1] || {};
    const distanceKm = (session.total_distance || lastRecord.distance || 0) / 1000;

    const startTime = session.start_time
      ? new Date(session.start_time)
      : records[0]?.timestamp
        ? new Date(records[0].timestamp)
        : new Date();

    const durationSec = session.total_elapsed_time
      ? Math.round(session.total_elapsed_time)
      : records.length > 1
        ? Math.round(
            (new Date(records[records.length - 1].timestamp).getTime() -
              new Date(records[0].timestamp).getTime()) /
              1000
          )
        : 0;

    const avgHr = session.avg_heart_rate || this.calculateAvgHR(records);
    const maxHr = session.max_heart_rate || this.calculateMaxHR(records);
    const elevationGainM = session.total_ascent ?? this.calculateElevationGain(records);
    const elevationLossM = session.total_descent ?? this.calculateElevationLoss(records);

    const splits = this.calculateSplits(records);
    const heartRateSeries = this.extractHeartRateSeries(records);
    const elevationSeries = this.extractElevationSeries(records);
    const paceSeries = this.extractLivePaceSeries(records); // Optional for future

    return {
      user: { connect: { id: userId } },
      name: session.sport || 'Unnamed Activity',
      sportType: session.sport || 'running',
      startTime,
      distanceKm: parseFloat(distanceKm.toFixed(2)),
      durationSec,
      avgPace: this.calculateAvgPace(durationSec, distanceKm),
      avgHr,
      maxHr,
      elevationGainM,
      elevationLossM,
      splits,
      heartRateSeries,
      elevationSeries,
      // paceSeries // Uncomment if your DB supports it
    };
  }

  private calculateAvgPace(durationSec: number, distanceKm: number): string {
    if (distanceKm === 0) return '0:00';
    const paceSecPerKm = durationSec / distanceKm;
    const minutes = Math.floor(paceSecPerKm / 60);
    const seconds = Math.round(paceSecPerKm % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private calculateAvgHR(records: any[]): number | null {
    const hrValues = records.map(r => r.heart_rate).filter(Boolean);
    if (!hrValues.length) return null;
    const avg = hrValues.reduce((sum, hr) => sum + hr, 0) / hrValues.length;
    return Math.round(avg);
  }

  private calculateMaxHR(records: any[]): number | null {
    const hrValues = records.map(r => r.heart_rate).filter(Boolean);
    return hrValues.length ? Math.max(...hrValues) : null;
  }

  private calculateElevationGain(records: any[]): number | null {
    let gain = 0;
    let lastAltitude: number | null = null;
    for (const record of records) {
      if (record.altitude != null) {
        if (lastAltitude != null && record.altitude > lastAltitude) {
          gain += record.altitude - lastAltitude;
        }
        lastAltitude = record.altitude;
      }
    }
    return gain || null;
  }

  private calculateElevationLoss(records: any[]): number | null {
    let loss = 0;
    let lastAltitude: number | null = null;
    for (const record of records) {
      if (record.altitude != null) {
        if (lastAltitude != null && record.altitude < lastAltitude) {
          loss += lastAltitude - record.altitude;
        }
        lastAltitude = record.altitude;
      }
    }
    return loss || null;
  }

  private calculateSplits(records: any[]): any[] {
    const splits: {
      km: number;
      time: string;
      avg_hr: number | null;
      elevation_gain: number;
    }[] = [];
    
    let currentKm = 1;
    let splitStartTime = records[0]?.timestamp ? new Date(records[0].timestamp).getTime() : 0;
    let hrSum = 0;
    let hrCount = 0;
    let elevationGain = 0;
    let lastAltitude: number | null = null;

    for (const record of records) {
      const distance = record.distance || 0;
      const kmDistance = distance / 1000;

      if (kmDistance >= currentKm) {
        const timeMs = new Date(record.timestamp).getTime() - splitStartTime;
        const minutes = Math.floor(timeMs / 60000);
        const seconds = Math.round((timeMs % 60000) / 1000);

        splits.push({
          km: currentKm,
          time: `${minutes}:${seconds.toString().padStart(2, '0')}`,
          avg_hr: hrCount > 0 ? Math.round(hrSum / hrCount) : null,
          elevation_gain: Math.round(elevationGain),
        });

        currentKm++;
        splitStartTime = new Date(record.timestamp).getTime();
        hrSum = 0;
        hrCount = 0;
        elevationGain = 0;
      }

      if (record.heart_rate) {
        hrSum += record.heart_rate;
        hrCount++;
      }

      if (record.altitude != null && lastAltitude != null) {
        const diff = record.altitude - lastAltitude;
        if (diff > 0) elevationGain += diff;
      }

      if (record.altitude != null) lastAltitude = record.altitude;
    }

    return splits;
  }

  private extractHeartRateSeries(records: any[]): any[] {
    return records
      .filter(r => r.heart_rate && r.timestamp)
      .map(r => ({
        timestamp: new Date(r.timestamp).toISOString(),
        hr: r.heart_rate,
      }));
  }

  private extractElevationSeries(records: any[]): any[] {
    return records
      .filter(r => r.altitude && r.timestamp)
      .map(r => ({
        timestamp: new Date(r.timestamp).toISOString(),
        elevation: r.altitude,
      }));
  }

  private extractLivePaceSeries(records: any[]): any[] {
    return records
      .filter(r => r.speed && r.timestamp)
      .map(r => {
        const speed = r.speed; // in m/s
        const pace = speed > 0 ? (1 / (speed * 3.6)) * 60 : 0; // min/km
        const minutes = Math.floor(pace);
        const seconds = Math.round((pace % 1) * 60);
        return {
          timestamp: new Date(r.timestamp).toISOString(),
          pace: `${minutes}:${seconds.toString().padStart(2, '0')}`,
        };
      });
  }
}
