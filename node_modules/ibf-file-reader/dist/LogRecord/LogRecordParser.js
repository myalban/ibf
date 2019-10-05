"use strict";
/*
 * Copyright 2018 Darren Lee <balshor@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
 * IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const LogRecord_1 = require("./LogRecord");
function parseLogRecord(ibfRecord) {
    let it = ibfRecord.byteReader();
    if (it.remaining() < 18) {
        return [Error('Insufficient data: ' + it.remaining()), null];
    }
    let logType = it.nextInt8();
    if (logType != LogRecord_1.LogRecordType.HISTORY && logType != LogRecord_1.LogRecordType.PUMP_ALARM) {
        return [Error('Unknown log record type: ' + logType), null];
    }
    let logIndex = it.nextInt32BE();
    let recordSize = it.nextUInt16BE();
    let errorCode = it.nextUInt16BE();
    let timestamp = it.nextDate();
    it.skip(1);
    let secondsSincePowerUp = it.nextUInt32LE();
    switch (logType) {
        case LogRecord_1.LogRecordType.HISTORY:
            let historyLogRecordType = it.nextInt32LE();
            let foundRecordType = LogRecord_1.HistoryLogRecordType.values().find(value => value === historyLogRecordType);
            if (foundRecordType === undefined) {
                return [Error('Unknown history log record type: ' + historyLogRecordType), null];
            }
            let historyLogRecordFlagsValue = it.nextUInt16LE();
            let historyLogRecordFlags = LogRecord_1.HistoryLogRecordFlag.values().filter(flag => (flag & historyLogRecordFlagsValue) != 0);
            it.skip(2);
            switch (historyLogRecordType) {
                case LogRecord_1.HistoryLogRecordType.BASAL_RATE: {
                    let basalRatePerHour = it.nextUInt32LE() / 100;
                    let durationInMinutes = it.nextUInt16LE();
                    let percent = it.nextUInt16LE() / 100;
                    return [null, new LogRecord_1.BasalLogRecord(logType, logIndex, timestamp, secondsSincePowerUp, errorCode, historyLogRecordType, new Set(historyLogRecordFlags), basalRatePerHour, durationInMinutes, percent)];
                }
                case LogRecord_1.HistoryLogRecordType.BOLUS: {
                    let units = it.nextUInt32LE() / 100;
                    let extendedDurationMinutes = it.nextUInt16LE();
                    let calculationRecordOffset = it.nextUInt16LE();
                    let immediateDurationSeconds = it.nextUInt16LE();
                    return [null, new LogRecord_1.BolusLogRecord(logType, logIndex, timestamp, secondsSincePowerUp, errorCode, historyLogRecordType, new Set(historyLogRecordFlags), units, extendedDurationMinutes, calculationRecordOffset, immediateDurationSeconds)];
                }
                case LogRecord_1.HistoryLogRecordType.DATE_CHANGE: {
                    let newDate = it.nextDate();
                    return [null, new LogRecord_1.DateChangeLogRecord(logType, logIndex, timestamp, secondsSincePowerUp, errorCode, historyLogRecordType, new Set(historyLogRecordFlags), newDate)];
                }
                case LogRecord_1.HistoryLogRecordType.TIME_CHANGE: {
                    let newTime = it.nextDate();
                    return [null, new LogRecord_1.TimeChangeLogRecord(logType, logIndex, timestamp, secondsSincePowerUp, errorCode, historyLogRecordType, new Set(historyLogRecordFlags), newTime)];
                }
                case LogRecord_1.HistoryLogRecordType.SUGGESTED_CALC: {
                    let correctionDelivered = it.nextUInt32LE() / 100;
                    let carbBolusDelivered = it.nextUInt32LE() / 100;
                    let correctionProgrammed = it.nextUInt32LE() / 100;
                    let carbBolusProgrammed = it.nextUInt32LE() / 100;
                    let correctionSuggested = it.nextInt32LE() / 100;
                    let carbBolusSuggested = it.nextUInt32LE() / 100;
                    let correctionJob = it.nextUInt32LE();
                    let mealJob = it.nextUInt32LE();
                    let correctionFactorUsed = it.nextUInt16LE();
                    let currentBG = it.nextUInt16LE();
                    let targetBG = it.nextUInt16LE();
                    let correctionThresholdBG = it.nextUInt16LE();
                    let carbGrams = it.nextInt16LE();
                    let icRatioUsed = it.nextUInt16LE();
                    return [null, new LogRecord_1.SuggestedCalculationLogRecord(logType, logIndex, timestamp, secondsSincePowerUp, errorCode, historyLogRecordType, new Set(historyLogRecordFlags), correctionDelivered, carbBolusDelivered, correctionProgrammed, carbBolusProgrammed, correctionSuggested, carbBolusSuggested, correctionJob, mealJob, correctionFactorUsed, currentBG, targetBG, correctionThresholdBG, carbGrams, icRatioUsed)];
                }
                case LogRecord_1.HistoryLogRecordType.REMOTE_HAZARD_ALARM: {
                    let alarmTime = it.nextDate();
                    it.skip(1);
                    let alarmType = it.nextUInt16LE();
                    let fileNumber = it.nextUInt16LE();
                    let lineNumber = it.nextUInt16LE();
                    let alarmErrorCode = it.nextUInt16LE();
                    return [null, new LogRecord_1.RemoteHazardAlarmLogRecord(logType, logIndex, timestamp, secondsSincePowerUp, errorCode, historyLogRecordType, new Set(historyLogRecordFlags), alarmTime, alarmType, fileNumber, lineNumber, alarmErrorCode)];
                }
                case LogRecord_1.HistoryLogRecordType.ALARM: {
                    let alarmTime = it.nextDate();
                    it.skip(1);
                    let alarmType = it.nextUInt16LE();
                    let fileNumber = it.nextUInt16LE();
                    let lineNumber = it.nextUInt16LE();
                    let alarmErrorCode = it.nextUInt16LE();
                    return [null, new LogRecord_1.AlarmLogRecord(logType, logIndex, timestamp, secondsSincePowerUp, errorCode, historyLogRecordType, new Set(historyLogRecordFlags), alarmTime, alarmType, fileNumber, lineNumber, alarmErrorCode)];
                }
                case LogRecord_1.HistoryLogRecordType.BLOOD_GLUCOSE: {
                    let bgErrorCode = it.nextUInt32LE();
                    let bgReading = it.nextUInt16LE();
                    let userTag1 = it.nextString(24);
                    let userTag2 = it.nextString(24);
                    let bgFlagsValue = it.nextInt8();
                    return [null, new LogRecord_1.BloodGlucoseLogRecord(logType, logIndex, timestamp, secondsSincePowerUp, errorCode, historyLogRecordType, new Set(historyLogRecordFlags), bgErrorCode, bgReading, userTag1, userTag2, LogRecord_1.BloodGlucoseFlag.fromBitSet(bgFlagsValue))];
                }
                case LogRecord_1.HistoryLogRecordType.CARB: {
                    let carbs = it.nextUInt16LE();
                    let wasPreset = it.nextInt8();
                    let presetType = it.nextInt8();
                    return [null, new LogRecord_1.CarbLogRecord(logType, logIndex, timestamp, secondsSincePowerUp, errorCode, historyLogRecordType, new Set(historyLogRecordFlags), carbs, wasPreset, presetType)];
                }
                case LogRecord_1.HistoryLogRecordType.TERMINATE_BOLUS: {
                    let insulinLeft = it.nextUInt32LE() / 100;
                    let timeLeftMinutes = it.nextUInt16LE();
                    return [null, new LogRecord_1.TerminateBolusLogRecord(logType, logIndex, timestamp, secondsSincePowerUp, errorCode, historyLogRecordType, new Set(historyLogRecordFlags), insulinLeft, timeLeftMinutes)];
                }
                case LogRecord_1.HistoryLogRecordType.TERMINATE_BASAL: {
                    let timeLeftMinutes = it.nextUInt16LE();
                    return [null, new LogRecord_1.TerminateBasalLogRecord(logType, logIndex, timestamp, secondsSincePowerUp, errorCode, historyLogRecordType, new Set(historyLogRecordFlags), timeLeftMinutes)];
                }
                case LogRecord_1.HistoryLogRecordType.ACTIVATE: {
                    let lotNumber = it.nextUInt16LE();
                    let serialNumber = it.nextUInt16LE();
                    let podVersion = it.nextVersion();
                    let interlockVersion = it.nextVersion();
                    return [null, new LogRecord_1.ActivateLogRecord(logType, logIndex, timestamp, secondsSincePowerUp, errorCode, historyLogRecordType, new Set(historyLogRecordFlags), lotNumber, serialNumber, podVersion, interlockVersion)];
                }
                default:
                    return [null, new LogRecord_1.HistoryLogRecord(logType, logIndex, timestamp, secondsSincePowerUp, errorCode, historyLogRecordType, new Set(historyLogRecordFlags))];
            }
        case LogRecord_1.LogRecordType.PUMP_ALARM:
            let alarmTimestamp = it.nextDate();
            it.skip(1);
            let alarmTypeID = it.nextInt8();
            it.skip(1);
            let alarmErrorCode = it.nextInt8();
            let lotNumber = it.nextUInt32LE();
            let seqNumber = it.nextUInt32LE();
            let processorVersion = it.nextVersion();
            let interlockVersion = it.nextVersion();
            return [null, new LogRecord_1.PumpAlarmDetails(logType, logIndex, timestamp, secondsSincePowerUp, errorCode, alarmTimestamp, LogRecord_1.AlarmType.forID(alarmTypeID), alarmErrorCode, lotNumber, seqNumber, processorVersion, interlockVersion)];
        default:
            throw Error('Assertion failure: should be unreachable due to earlier log record type check.');
    }
}
exports.parseLogRecord = parseLogRecord;
//# sourceMappingURL=LogRecordParser.js.map