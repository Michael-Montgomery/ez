// Bundled SAMPLE dataset for the public demo.
//
// This is FICTIONAL data — a synthetic E-ZPass account generated to exercise
// every feature of the app (multiple agencies, PA Turnpike mileposts,
// dynamically-priced express lanes, ticketed entry/exit trips, in-network vs
// "E-ZPass Away" billing lag, credit-card top-ups). It contains no real
// person's travel history and no transponder/plate identifiers. Users see
// their own data by uploading their own CSV.
export const RAW_CSV = `Posting Date,Transaction Date,Transponder/PlateNumber,Agency,Type,Entry Time,Entry Plaza,Entry Lane,Exit Time,Exit Plaza,Exit Lane,Vehicle Class,Amount,Balance
7/5/2026 8:21:14 AM,6/20/2026 10:30:48 AM,,PTC,E-ZPass Away Toll Charge,6/20/2026 10:30:48 AM,T 247,3,,T 333,4,2,$8.90,$35.09
7/3/2026 11:47:08 PM,6/14/2026 8:05:50 AM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 326,8,2,$1.72,$43.99
7/1/2026 10:13:12 AM,6/17/2026 7:40:37 AM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 340,2,2,$1.34,$45.71
7/1/2026 3:46:27 AM,6/16/2026 7:40:23 AM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 340,4,2,$1.49,$47.05
6/30/2026 9:42:55 AM,6/15/2026 6:30:13 PM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 333,8,2,$1.72,$48.54
6/25/2026 10:51:07 PM,6/17/2026 5:25:20 PM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 333,1,2,$1.38,$50.26
6/25/2026 3:50:08 PM,6/9/2026 5:25:26 PM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 333,5,2,$1.25,$51.64
6/24/2026 10:11:29 PM,6/15/2026 5:45:48 PM,,DelDOT,E-ZPass Away Toll Charge,,***,0,,Newark Plaza,5,2,$5.00,$52.89
6/24/2026 3:58:52 PM,6/7/2026 5:45:08 PM,,NJTP,E-ZPass Away Toll Charge,6/7/2026 5:45:08 PM,I-278/Eliz/Goethals/Verrazano,7,,PA Turnpike/Florence,7,1,$10.51,$57.89
6/23/2026 8:37:43 PM,6/14/2026 8:55:15 AM,,DelDOT,E-ZPass Away Toll Charge,,***,0,,Newark Plaza,6,2,$5.00,$68.40
6/23/2026 5:24:44 PM,6/16/2026 5:25:51 PM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 333,4,2,$1.38,$73.40
6/22/2026 9:26:54 PM,6/5/2026 7:40:45 AM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 340,6,2,$1.26,$74.78
6/21/2026 12:44:38 PM,6/12/2026 7:40:30 AM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 340,5,2,$1.42,$76.04
6/21/2026 12:38:35 AM,6/10/2026 7:40:03 AM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 340,3,2,$1.46,$77.46
6/20/2026 4:02:41 AM,6/7/2026 5:10:27 PM,,PANYNJ,E-ZPass Away Toll Charge,,***,0,,Goethals Br,5,1,$18.55,$78.92
6/19/2026 12:22:16 AM,6/6/2026 12:05:24 PM,,NJTP,E-ZPass Away Toll Charge,6/6/2026 12:05:24 PM,PA Turnpike/Florence,1,,I-278/Eliz/Goethals/Verrazano,1,1,$10.51,$97.47
6/18/2026 11:58:32 AM,6/6/2026 12:35:15 PM,,MTABT,E-ZPass Away Toll Charge,,***,0,,Verrazano Narrows Br,4,3,$12.03,$107.98
6/17/2026 8:48:19 PM,6/12/2026 5:25:40 PM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 333,3,2,$1.38,$120.01
6/16/2026 3:25:37 AM,6/15/2026 4:20:40 PM,,MDTA,Toll Charge,,***,0,6/15/2026 4:20:40 PM,I-95 JFK Memorial Highway,8,2,$6.00,$121.39
6/15/2026 11:56:09 PM,6/15/2026 5:05:41 PM,,MDTA,Toll Charge,6/15/2026 5:05:41 PM,I-95N ETL/I-895/MoraviaRd,4,6/15/2026 5:05:41 PM,I-95N ETL/MD 152,7,2,$2.45,$127.39
6/15/2026 9:05:32 PM,6/15/2026 9:05:32 PM,,,Credit Card Payment,,,,,,,,$60.00,$129.84
6/14/2026 10:42:28 PM,6/14/2026 10:10:33 AM,,MDTA,Toll Charge,,***,0,6/14/2026 10:10:33 AM,I-95 Fort McHenry Tunnel,5,2,$3.00,$69.84
6/14/2026 9:48:11 PM,6/14/2026 9:40:02 AM,,MDTA,Toll Charge,6/14/2026 9:40:02 AM,I-95S ETL/MD43/WhiteMarsh,4,6/14/2026 9:40:02 AM,I-95S ETL/I-895/MoraviaRd,4,2,$1.64,$72.84
6/14/2026 7:48:16 PM,6/10/2026 5:25:54 PM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 333,2,2,$1.29,$74.48
6/14/2026 8:38:16 AM,6/5/2026 5:25:59 PM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 333,1,2,$1.49,$75.77
6/13/2026 8:21:36 PM,6/9/2026 7:40:50 AM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 340,3,2,$1.42,$77.26
6/13/2026 7:42:29 PM,6/3/2026 5:25:45 PM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 333,1,2,$1.25,$78.68
6/13/2026 4:22:19 PM,6/3/2026 7:40:01 AM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 340,1,2,$1.50,$79.93
6/13/2026 3:19:03 PM,6/7/2026 6:50:49 PM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 333,2,2,$1.50,$81.43
6/11/2026 3:41:29 PM,5/29/2026 5:25:09 PM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 333,8,2,$1.22,$82.93
6/11/2026 3:15:36 PM,6/6/2026 11:15:48 AM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 352,7,2,$1.50,$84.15
6/11/2026 1:27:27 AM,5/27/2026 7:40:55 AM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 340,7,2,$1.45,$85.65
6/10/2026 7:05:08 PM,5/29/2026 7:40:49 AM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 340,6,2,$1.46,$87.10
6/10/2026 5:53:58 PM,6/2/2026 7:40:54 AM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 340,4,2,$1.44,$88.56
6/10/2026 9:18:07 AM,5/24/2026 8:05:39 AM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 326,8,2,$1.72,$90.00
6/8/2026 3:48:36 AM,6/2/2026 5:25:34 PM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 333,2,2,$1.22,$91.72
6/7/2026 1:52:29 PM,5/25/2026 6:30:55 PM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 333,1,2,$1.72,$92.94
6/7/2026 1:22:50 AM,5/22/2026 5:25:05 PM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 333,8,2,$1.22,$94.66
6/6/2026 2:59:32 PM,5/27/2026 5:25:35 PM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 333,5,2,$1.29,$95.88
6/6/2026 2:12:14 AM,5/26/2026 7:40:48 AM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 340,1,2,$1.30,$97.17
6/5/2026 11:58:29 AM,5/26/2026 5:25:16 PM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 333,2,2,$1.23,$98.47
6/3/2026 10:00:58 PM,5/18/2026 7:40:02 AM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 340,4,2,$1.39,$99.70
6/3/2026 7:29:18 PM,5/25/2026 5:45:36 PM,,DelDOT,E-ZPass Away Toll Charge,,***,0,,Newark Plaza,7,2,$5.00,$101.09
6/3/2026 6:09:11 PM,5/22/2026 7:40:51 AM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 340,2,2,$1.34,$106.09
6/1/2026 7:40:21 PM,6/1/2026 7:40:21 PM,,,Credit Card Payment,,,,,,,,$50.00,$107.43
6/1/2026 7:24:40 AM,5/19/2026 7:40:50 AM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 340,4,2,$1.25,$57.43
5/31/2026 11:33:34 PM,5/19/2026 5:25:19 PM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 333,2,2,$1.34,$58.68
5/31/2026 3:47:37 PM,5/24/2026 8:55:30 AM,,DelDOT,E-ZPass Away Toll Charge,,***,0,,Newark Plaza,2,2,$5.00,$60.02
5/30/2026 9:20:10 PM,5/18/2026 5:25:02 PM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 333,5,2,$1.45,$65.02
5/29/2026 4:21:10 AM,5/20/2026 7:40:48 AM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 340,7,2,$1.24,$66.47
5/26/2026 10:52:20 PM,5/20/2026 5:25:00 PM,,PTC,E-ZPass Away Toll Charge,,***,0,,T 333,8,2,$1.23,$67.71
5/25/2026 10:41:54 PM,5/25/2026 4:20:38 PM,,MDTA,Toll Charge,,***,0,5/25/2026 4:20:38 PM,I-95 JFK Memorial Highway,8,2,$6.00,$68.94
5/25/2026 10:09:21 PM,5/25/2026 5:05:01 PM,,MDTA,Toll Charge,5/25/2026 5:05:01 PM,I-95N ETL/I-895/MoraviaRd,5,5/25/2026 5:05:01 PM,I-95N ETL/MD 152,5,2,$3.05,$74.94
5/25/2026 3:00:00 PM,5/24/2026 10:10:53 AM,,MDTA,Toll Charge,,***,0,5/24/2026 10:10:53 AM,I-95 Fort McHenry Tunnel,4,2,$3.00,$77.99
5/25/2026 9:23:22 AM,5/24/2026 9:40:13 AM,,MDTA,Toll Charge,5/24/2026 9:40:13 AM,I-95S ETL/MD43/WhiteMarsh,8,5/24/2026 9:40:13 AM,I-95S ETL/I-895/MoraviaRd,1,2,$1.41,$80.99
5/17/2026 8:15:11 PM,5/17/2026 8:15:11 PM,,,Credit Card Payment,,,,,,,,$60.00,$82.40`;
