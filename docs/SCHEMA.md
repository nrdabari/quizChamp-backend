# MongoDB Schema – olympiadDB
_Last generated: 2025-09-18T03:16:46.907Z_


## studenttasks
### Fields
| Field (dot path) | Type(s) | Presence | Example |
|---|---|---:|---|
| `__v` | Number | 100.0% | `0` |
| `_id` | ObjectId | 100.0% | `{"$oid":"689d748adf14e04735c1778d"}` |
| `assignedDate` | Date | 100.0% | `{"$date":"2025-08-14T05:30:50.085Z"}` |
| `completedAt` | Date | 58.3% | `{"$date":"2025-08-14T05:31:40.779Z"}` |
| `completionPercentage` | Number | 100.0% | `100` |
| `createdAt` | Date | 100.0% | `{"$date":"2025-08-14T05:30:50.088Z"}` |
| `customDuration` | Number | 100.0% | `4` |
| `dueDate` | Date | 100.0% | `{"$date":"2025-08-14T05:30:50.085Z"}` |
| `favorite.addedToFavoritesAt` | Date | 58.3% | `{"$date":"2025-08-14T06:14:11.943Z"}` |
| `favorite.isFavorite` | Boolean | 100.0% | `false` |
| `favorite.lastPracticed` | Date | 58.3% | `{"$date":"2025-08-14T06:14:11.943Z"}` |
| `favorite.practiceCount` | Number | 100.0% | `2` |
| `priority` | String | 100.0% | `"medium"` |
| `revision.isRevision` | Boolean | 100.0% | `false` |
| `revision.nextRevisionDate` | Date | 58.3% | `{"$date":"2025-08-17T05:31:40.858Z"}` |
| `revision.revisionNumber` | Number | 100.0% | `0` |
| `revision.scheduledRevisions` | Array<Object>|Array<Mixed> | 100.0% | `[{"revisionNumber":1,"scheduledDate":{"$date":"2025-08-17T05:31:40.858Z"},"type":"short_term","completed":false,"_id":{"$oid":"689d74bcdf14e04735c177a6"}},{"revisionNumber":2,"scheduledDate":{"$date":"2025-08-21T05:31:40.858Z"},"type":"medium_term","completed":false,"_id":{"$oid":"689d74bcdf14e04735c177a7"}}]` |
| `revision.scheduledRevisions[]` | Object | 100.0% | `{"revisionNumber":1,"scheduledDate":{"$date":"2025-08-17T05:31:40.858Z"},"type":"short_term","completed":false,"_id":{"$oid":"689d74bcdf14e04735c177a6"}}` |
| `revision.scheduledRevisions[]._id` | ObjectId | 175.0% | `{"$oid":"689d74bcdf14e04735c177a6"}` |
| `revision.scheduledRevisions[].completed` | Boolean | 175.0% | `false` |
| `revision.scheduledRevisions[].revisionNumber` | Number | 175.0% | `1` |
| `revision.scheduledRevisions[].scheduledDate` | Date | 175.0% | `{"$date":"2025-08-17T05:31:40.858Z"}` |
| `revision.scheduledRevisions[].type` | String | 175.0% | `"short_term"` |
| `source` | String | 100.0% | `"self_created"` |
| `status` | String | 100.0% | `"completed"` |
| `studentId` | ObjectId | 100.0% | `{"$oid":"68760bb8a5220aa9e82df5b1"}` |
| `taskId` | ObjectId | 100.0% | `{"$oid":"689d7489df14e04735c1778b"}` |
| `timer.lastUpdated` | Date | 100.0% | `{"$date":"2025-08-14T05:30:50.085Z"}` |
| `timer.sessions` | Array<Mixed> | 100.0% | `[]` |
| `timer.sessions[]` |  | 100.0% | `null` |
| `timer.startedAt` | Date | 8.3% | `{"$date":"2025-08-13T16:09:14.217Z"}` |
| `timer.state` | String | 100.0% | `"stopped"` |
| `timer.timeRemaining` | Number | 100.0% | `4` |
| `timer.totalTimeSpent` | Number | 100.0% | `0` |
| `updatedAt` | Date | 100.0% | `{"$date":"2025-08-14T06:14:26.723Z"}` |

### Indexes
| Name | Keys (order) | Unique | TTL (s) | Partial Filter |
|---|---|:---:|:---:|---|
| `_id_` | `{"_id":1}` |  |  | `` |
| `studentId_1_assignedDate_1` | `{"studentId":1,"assignedDate":1}` |  |  | `` |
| `studentId_1_status_1` | `{"studentId":1,"status":1}` |  |  | `` |
| `studentId_1_favorite.isFavorite_1` | `{"studentId":1,"favorite.isFavorite":1}` |  |  | `` |
| `studentId_1_revision.nextRevisionDate_1` | `{"studentId":1,"revision.nextRevisionDate":1}` |  |  | `` |
| `timer.state_1` | `{"timer.state":1}` |  |  | `` |

### Sample document
```json
{"_id":{"$oid":"689d748adf14e04735c1778d"},"studentId":{"$oid":"68760bb8a5220aa9e82df5b1"},"taskId":{"$oid":"689d7489df14e04735c1778b"},"assignedDate":{"$date":{"$numberLong":"1755149450085"}},"dueDate":{"$date":{"$numberLong":"1755149450085"}},"customDuration":{"$numberInt":"4"},"status":"completed","priority":"medium","source":"self_created","timer":{"state":"stopped","timeRemaining":{"$numberInt":"4"},"totalTimeSpent":{"$numberInt":"0"},"lastUpdated":{"$date":{"$numberLong":"1755149450085"}},"sessions":[]},"completionPercentage":{"$numberInt":"100"},"revision":{"isRevision":false,"revisionNumber":{"$numberInt":"0"},"scheduledRevisions":[{"revisionNumber":{"$numberInt":"1"},"scheduledDate":{"$date":{"$numberLong":"1755408700858"}},"type":"short_term","completed":false,"_id":{"$oid":"689d74bcdf14e04735c177a6"}},{"revisionNumber":{"$numberInt":"2"},"scheduledDate":{"$date":{"$numberLong":"1755754300858"}},"type":"medium_term","completed":false,"_id":{"$oid":"689d74bcdf14e04735c177a7"}},{"revisionNumber":{"$numberInt":"3"},"scheduledDate":{"$date":{"$numberLong":"1757741500858"}},"type":"long_term","completed":false,"_id":{"$oid":"689d74bcdf14e04735c177a8"}}],"nextRevisionDate":{"$date":{"$numberLong":"1755408700858"}}},"favorite":{"isFavorite":false,"practiceCount":{"$numberInt":"2"},"addedToFavoritesAt":{"$date":{"$numberLong":"1755152051943"}},"lastPracticed":{"$date":{"$numberLong":"1755152051943"}}},"createdAt":{"$date":{"$numberLong":"1755149450088"}},"updatedAt":{"$date":{"$numberLong":"1755152066723"}},"__v":{"$numberInt":"0"},"completedAt":{"$date":{"$numberLong":"1755149500779"}}}
```

> Sampled 12 document(s).

---

## tasks
### Fields
| Field (dot path) | Type(s) | Presence | Example |
|---|---|---:|---|
| `__v` | Number | 100.0% | `0` |
| `_id` | ObjectId | 100.0% | `{"$oid":"68abee9de95882073ade1768"}` |
| `category` | String | 100.0% | `"Personal"` |
| `createdAt` | Date | 100.0% | `{"$date":"2025-08-25T05:03:25.565Z"}` |
| `createdBy` | ObjectId | 100.0% | `{"$oid":"68760bb8a5220aa9e82df5b1"}` |
| `defaultDuration` | Number | 100.0% | `10` |
| `description` | String | 100.0% | `"Abacus- 2digit Addition Subtraction"` |
| `isActive` | Boolean | 100.0% | `true` |
| `subject` | String | 100.0% | `"Abacus"` |
| `title` | String | 100.0% | `"Abacus- 2digit Addition Subtraction"` |
| `updatedAt` | Date | 100.0% | `{"$date":"2025-08-25T05:03:25.565Z"}` |

### Indexes
| Name | Keys (order) | Unique | TTL (s) | Partial Filter |
|---|---|:---:|:---:|---|
| `_id_` | `{"_id":1}` |  |  | `` |
| `createdBy_1` | `{"createdBy":1}` |  |  | `` |
| `subject_1_category_1` | `{"subject":1,"category":1}` |  |  | `` |

### Sample document
```json
{"_id":{"$oid":"68abee9de95882073ade1768"},"title":"Abacus- 2digit Addition Subtraction","description":"Abacus- 2digit Addition Subtraction","subject":"Abacus","category":"Personal","defaultDuration":{"$numberInt":"10"},"createdBy":{"$oid":"68760bb8a5220aa9e82df5b1"},"isActive":true,"createdAt":{"$date":{"$numberLong":"1756098205565"}},"updatedAt":{"$date":{"$numberLong":"1756098205565"}},"__v":{"$numberInt":"0"}}
```

> Sampled 25 document(s).

---

## exercises
### Fields
| Field (dot path) | Type(s) | Presence | Example |
|---|---|---:|---|
| `__v` | Number | 100.0% | `0` |
| `_id` | ObjectId | 100.0% | `{"$oid":"68c183b706b1894c57c1a441"}` |
| `chapter` | String | 100.0% | `""` |
| `chapterId` | ObjectId | 79.4% | `{"$oid":"68a96b0ec0f97f4ea24dfdec"}` |
| `class` | Number | 100.0% | `5` |
| `createdAt` | Date | 100.0% | `{"$date":"2025-09-10T13:57:11.687Z"}` |
| `directions` | Array<Object>|Array<Mixed> | 100.0% | `[{"text":"","start":null,"end":null,"_id":{"$oid":"68c183b706b1894c57c1a442"}}]` |
| `directions[]` | Object | 100.0% | `{"text":"","start":null,"end":null,"_id":{"$oid":"68c183b706b1894c57c1a442"}}` |
| `directions[]._id` | ObjectId | 234.9% | `{"$oid":"68c183b706b1894c57c1a442"}` |
| `directions[].end` | Null|Number | 234.9% | `null` |
| `directions[].imagePath` | String | 6.3% | `"https://olympiad-practice-images.s3.ap-south-1.amazonaws.com/directions/68a3e204ada4b9118fe3ea57-1755746422640.jpg"` |
| `directions[].start` | Null|Number | 234.9% | `null` |
| `directions[].text` | String | 234.9% | `""` |
| `headers` | Array<Object>|Array<Mixed> | 100.0% | `[{"text":"","start":null,"end":null,"_id":{"$oid":"68c183b706b1894c57c1a443"}}]` |
| `headers[]` | Object | 100.0% | `{"text":"","start":null,"end":null,"_id":{"$oid":"68c183b706b1894c57c1a443"}}` |
| `headers[]._id` | ObjectId | 104.8% | `{"$oid":"68c183b706b1894c57c1a443"}` |
| `headers[].end` | Null|Number | 104.8% | `null` |
| `headers[].start` | Null|Number | 104.8% | `null` |
| `headers[].text` | String | 104.8% | `""` |
| `isActive` | Boolean | 100.0% | `true` |
| `name` | String | 100.0% | `"Comprehension"` |
| `sections` | Array<Object> | 100.0% | `[{"text":"","start":null,"end":null,"_id":{"$oid":"68c183b706b1894c57c1a444"}}]` |
| `sections[]` | Object | 100.0% | `{"text":"","start":null,"end":null,"_id":{"$oid":"68c183b706b1894c57c1a444"}}` |
| `sections[]._id` | ObjectId | 123.8% | `{"$oid":"68c183b706b1894c57c1a444"}` |
| `sections[].end` | Null|Number | 123.8% | `null` |
| `sections[].start` | Null|Number | 123.8% | `null` |
| `sections[].text` | String | 123.8% | `""` |
| `source` | String | 100.0% | `"Olympiad Guide"` |
| `subject` | String | 100.0% | `""` |
| `subjectId` | ObjectId | 100.0% | `{"$oid":"6881c73256cc49d262bb5e45"}` |
| `updatedAt` | Date | 100.0% | `{"$date":"2025-09-10T13:57:11.687Z"}` |

### Indexes
| Name | Keys (order) | Unique | TTL (s) | Partial Filter |
|---|---|:---:|:---:|---|
| `_id_` | `{"_id":1}` |  |  | `` |

### Sample document
```json
{"_id":{"$oid":"68c183b706b1894c57c1a441"},"name":"Comprehension","class":{"$numberInt":"5"},"subject":"","chapter":"","subjectId":{"$oid":"6881c73256cc49d262bb5e45"},"chapterId":{"$oid":"68a96b0ec0f97f4ea24dfdec"},"source":"Olympiad Guide","directions":[{"text":"","start":null,"end":null,"_id":{"$oid":"68c183b706b1894c57c1a442"}}],"headers":[{"text":"","start":null,"end":null,"_id":{"$oid":"68c183b706b1894c57c1a443"}}],"sections":[{"text":"","start":null,"end":null,"_id":{"$oid":"68c183b706b1894c57c1a444"}}],"isActive":true,"createdAt":{"$date":{"$numberLong":"1757512631687"}},"updatedAt":{"$date":{"$numberLong":"1757512631687"}},"__v":{"$numberInt":"0"}}
```

> Sampled 63 document(s).

---

## questions
### Fields
| Field (dot path) | Type(s) | Presence | Example |
|---|---|---:|---|
| `__v` | Number | 100.0% | `0` |
| `_id` | ObjectId | 100.0% | `{"$oid":"68a32aa6ba6b5be53aa71a74"}` |
| `chapterId` | Null|ObjectId | 67.4% | `null` |
| `correctAnswer` | String | 100.0% | `"(C)"` |
| `createdAt` | Date | 100.0% | `{"$date":"2025-08-18T13:29:10.931Z"}` |
| `exerciseId` | ObjectId | 100.0% | `{"$oid":"68a2c813ba6b5be53aa71957"}` |
| `gridOptions` | Array<Mixed>|Array<Array<String>> | 92.5% | `[]` |
| `gridOptions[]` | Array<String> | 92.5% | `["","P","Q","R",""]` |
| `id` | Number | 100.0% | `16` |
| `imagePath` | String|Null | 10.0% | `"https://olympiad-practice-images.s3.ap-south-1.amazonaws.com/questions/688af063d3aae23d3dd5b7a5.jpg"` |
| `optionType` | String | 92.5% | `"normal"` |
| `options` | Array<String>|Array<Mixed> | 100.0% | `["Meridian","Grid"]` |
| `options[]` | String | 100.0% | `"Meridian"` |
| `question` | String | 100.0% | `"The Equator is the most important latitude and is also called the"` |
| `subQuestion` | String | 91.5% | `""` |
| `updatedAt` | Date | 100.0% | `{"$date":"2025-08-18T13:29:10.931Z"}` |

### Indexes
| Name | Keys (order) | Unique | TTL (s) | Partial Filter |
|---|---|:---:|:---:|---|
| `_id_` | `{"_id":1}` |  |  | `` |

### Sample document
```json
{"_id":{"$oid":"68a32aa6ba6b5be53aa71a74"},"id":{"$numberInt":"16"},"exerciseId":{"$oid":"68a2c813ba6b5be53aa71957"},"question":"The Equator is the most important latitude and is also called the","optionType":"normal","options":["Meridian","Grid","Great circle","Parallel"],"gridOptions":[],"subQuestion":"","correctAnswer":"(C)","chapterId":null,"__v":{"$numberInt":"0"},"createdAt":{"$date":{"$numberLong":"1755523750931"}},"updatedAt":{"$date":{"$numberLong":"1755523750931"}}}
```

> Sampled 1000 document(s).

---

## taskstats
### Fields
| Field (dot path) | Type(s) | Presence | Example |
|---|---|---:|---|
| `__v` | Number | 100.0% | `0` |
| `_id` | ObjectId | 100.0% | `{"$oid":"68a73542ada4b9118fe43255"}` |
| `createdAt` | Date | 100.0% | `{"$date":"2025-08-21T15:03:30.121Z"}` |
| `favoriteStats.totalFavoritePractices` | Number | 100.0% | `0` |
| `favoriteStats.totalFavorites` | Number | 100.0% | `0` |
| `lastCalculated` | Date | 100.0% | `{"$date":"2025-09-08T15:20:01.412Z"}` |
| `revisionStats.revisionSuccessRate` | Number | 100.0% | `0` |
| `revisionStats.revisionsCompleted` | Number | 100.0% | `0` |
| `revisionStats.totalRevisionsCycle` | Number | 100.0% | `0` |
| `streaks.currentStreak` | Number | 100.0% | `0` |
| `streaks.longestStreak` | Number | 100.0% | `0` |
| `studentId` | ObjectId | 100.0% | `{"$oid":"68996fcf2eea56a109e5da56"}` |
| `subjectStats` | Array<Mixed> | 100.0% | `[]` |
| `subjectStats[]` |  | 100.0% | `null` |
| `totalTasksCompleted` | Number | 100.0% | `0` |
| `totalTasksCreated` | Number | 100.0% | `5` |
| `totalTimeStudied` | Number | 100.0% | `0` |
| `updatedAt` | Date | 100.0% | `{"$date":"2025-09-08T15:20:01.412Z"}` |
| `weeklyData` | Array<Mixed> | 100.0% | `[]` |
| `weeklyData[]` |  | 100.0% | `null` |

### Indexes
| Name | Keys (order) | Unique | TTL (s) | Partial Filter |
|---|---|:---:|:---:|---|
| `_id_` | `{"_id":1}` |  |  | `` |
| `studentId_1` | `{"studentId":1}` | ✓ |  | `` |

### Sample document
```json
{"_id":{"$oid":"68a73542ada4b9118fe43255"},"studentId":{"$oid":"68996fcf2eea56a109e5da56"},"totalTasksCreated":{"$numberInt":"5"},"totalTasksCompleted":{"$numberInt":"0"},"totalTimeStudied":{"$numberInt":"0"},"revisionStats":{"totalRevisionsCycle":{"$numberInt":"0"},"revisionsCompleted":{"$numberInt":"0"},"revisionSuccessRate":{"$numberInt":"0"}},"favoriteStats":{"totalFavorites":{"$numberInt":"0"},"totalFavoritePractices":{"$numberInt":"0"}},"streaks":{"currentStreak":{"$numberInt":"0"},"longestStreak":{"$numberInt":"0"}},"subjectStats":[],"weeklyData":[],"lastCalculated":{"$date":{"$numberLong":"1757344801412"}},"createdAt":{"$date":{"$numberLong":"1755788610121"}},"updatedAt":{"$date":{"$numberLong":"1757344801412"}},"__v":{"$numberInt":"0"}}
```

> Sampled 2 document(s).

---

## submissions
### Fields
| Field (dot path) | Type(s) | Presence | Example |
|---|---|---:|---|
| `__v` | Number | 100.0% | `52` |
| `_id` | ObjectId | 100.0% | `{"$oid":"688261bb8faac80e5ffb19e7"}` |
| `answers` | Array<Object>|Array<Mixed> | 100.0% | `[{"questionId":{"$oid":"688265238faac80e5ffb1b82"},"userAnswer":"(A)","isCorrect":true,"timeTaken":3}]` |
| `answers[]` | Object | 100.0% | `{"questionId":{"$oid":"688265238faac80e5ffb1b82"},"userAnswer":"(A)","isCorrect":true,"timeTaken":3}` |
| `answers[].isCorrect` | Boolean | 1721.2% | `true` |
| `answers[].questionId` | ObjectId | 1721.2% | `{"$oid":"688265238faac80e5ffb1b82"}` |
| `answers[].timeTaken` | Number | 1721.2% | `3` |
| `answers[].userAnswer` | String | 1721.2% | `"(A)"` |
| `createdAt` | Date | 100.0% | `{"$date":"2025-07-24T16:39:23.537Z"}` |
| `endedAt` | Date|Null | 95.2% | `{"$date":"2025-07-25T10:24:21.111Z"}` |
| `exerciseId` | ObjectId | 100.0% | `{"$oid":"68825ef975aceae42be17eef"}` |
| `score` | Number | 100.0% | `1` |
| `startedAt` | Date | 100.0% | `{"$date":"2025-07-24T16:39:23.528Z"}` |
| `status` | String | 95.2% | `"completed"` |
| `submittedAt` | Null | 5.8% | `null` |
| `timeLeft` | Null|Number | 92.3% | `null` |
| `totalTime` | Number | 89.4% | `30` |
| `totalTimeTaken` | Number | 100.0% | `63897` |
| `updatedAt` | Date | 100.0% | `{"$date":"2025-07-25T10:24:21.119Z"}` |
| `userId` | ObjectId | 100.0% | `{"$oid":"68760bb8a5220aa9e82df5b1"}` |

### Indexes
| Name | Keys (order) | Unique | TTL (s) | Partial Filter |
|---|---|:---:|:---:|---|
| `_id_` | `{"_id":1}` |  |  | `` |

### Sample document
```json
{"_id":{"$oid":"688261bb8faac80e5ffb19e7"},"userId":{"$oid":"68760bb8a5220aa9e82df5b1"},"exerciseId":{"$oid":"68825ef975aceae42be17eef"},"startedAt":{"$date":{"$numberLong":"1753375163528"}},"endedAt":{"$date":{"$numberLong":"1753439061111"}},"totalTimeTaken":{"$numberInt":"63897"},"score":{"$numberInt":"1"},"answers":[{"questionId":{"$oid":"688265238faac80e5ffb1b82"},"userAnswer":"(A)","isCorrect":true,"timeTaken":{"$numberInt":"3"}}],"status":"completed","timeLeft":null,"totalTime":{"$numberInt":"30"},"createdAt":{"$date":{"$numberLong":"1753375163537"}},"updatedAt":{"$date":{"$numberLong":"1753439061119"}},"__v":{"$numberInt":"52"}}
```

> Sampled 104 document(s).

---

## subjects
### Fields
| Field (dot path) | Type(s) | Presence | Example |
|---|---|---:|---|
| `_id` | ObjectId | 100.0% | `{"$oid":"6881c73256cc49d262bb5e49"}` |
| `classLevels` | Array<Number> | 100.0% | `[1,2]` |
| `classLevels[]` | Number | 100.0% | `1` |
| `code` | String | 100.0% | `"gk"` |
| `description` | String | 100.0% | `"Covers current affairs, facts, and trivia."` |
| `name` | String | 100.0% | `"General Knowledge"` |
| `shortName` | String | 100.0% | `"GK"` |

### Indexes
| Name | Keys (order) | Unique | TTL (s) | Partial Filter |
|---|---|:---:|:---:|---|
| `_id_` | `{"_id":1}` |  |  | `` |
| `code_1` | `{"code":1}` | ✓ |  | `` |

### Sample document
```json
{"_id":{"$oid":"6881c73256cc49d262bb5e49"},"name":"General Knowledge","code":"gk","shortName":"GK","description":"Covers current affairs, facts, and trivia.","classLevels":[{"$numberInt":"1"},{"$numberInt":"2"},{"$numberInt":"3"},{"$numberInt":"4"},{"$numberInt":"5"},{"$numberInt":"6"},{"$numberInt":"7"},{"$numberInt":"8"}]}
```

> Sampled 6 document(s).

---

## users
### Fields
| Field (dot path) | Type(s) | Presence | Example |
|---|---|---:|---|
| `__v` | Number | 66.7% | `3` |
| `_id` | ObjectId | 100.0% | `{"$oid":"68996fcf2eea56a109e5da56"}` |
| `createdAt` | Date|String | 100.0% | `{"$date":"2025-08-11T04:21:35.122Z"}` |
| `email` | String | 100.0% | `"drrahuldabari1@gmail.com"` |
| `grade` | String | 66.7% | `"5"` |
| `isActive` | Boolean | 100.0% | `true` |
| `name` | String | 100.0% | `"Rahul Dabari"` |
| `password` | String | 100.0% | `"$2b$12$MnEB1izLEK9H6IXYMZRzy.XhwYTmjaUMihS.NvqoiDkQCUNTc3dCu"` |
| `role` | String | 100.0% | `"user"` |
| `sourceAccess` | Array<String> | 66.7% | `["Workbook","Olympiad Guide"]` |
| `sourceAccess[]` | String | 66.7% | `"Workbook"` |
| `subjectsAccess` | Array<String> | 66.7% | `["6881c73256cc49d262bb5e45","6881c73256cc49d262bb5e46"]` |
| `subjectsAccess[]` | String | 66.7% | `"6881c73256cc49d262bb5e45"` |
| `updatedAt` | Date | 100.0% | `{"$date":"2025-09-18T02:12:35.872Z"}` |

### Indexes
| Name | Keys (order) | Unique | TTL (s) | Partial Filter |
|---|---|:---:|:---:|---|
| `_id_` | `{"_id":1}` |  |  | `` |
| `email_1` | `{"email":1}` | ✓ |  | `` |

### Sample document
```json
{"_id":{"$oid":"68996fcf2eea56a109e5da56"},"name":"Rahul Dabari","grade":"5","email":"drrahuldabari1@gmail.com","password":"$2b$12$MnEB1izLEK9H6IXYMZRzy.XhwYTmjaUMihS.NvqoiDkQCUNTc3dCu","role":"user","isActive":true,"subjectsAccess":["6881c73256cc49d262bb5e45","6881c73256cc49d262bb5e46","6881c73256cc49d262bb5e47","6881c73256cc49d262bb5e49","6881c73256cc49d262bb5e44"],"sourceAccess":["Workbook","Olympiad Guide","Previous Years Paper"],"createdAt":{"$date":{"$numberLong":"1754886095122"}},"updatedAt":{"$date":{"$numberLong":"1758161555872"}},"__v":{"$numberInt":"3"}}
```

> Sampled 3 document(s).

---

## chapters
### Fields
| Field (dot path) | Type(s) | Presence | Example |
|---|---|---:|---|
| `_id` | ObjectId | 100.0% | `{"$oid":"6881d59556cc49d262bb5e66"}` |
| `chapterNumber` | Number | 100.0% | `12` |
| `classLevel` | Number | 100.0% | `5` |
| `code` | String | 100.0% | `"vocabulary"` |
| `content` | String | 24.4% | `"Introduction to basic scientific principles, famous inventions and discoveries, modern gadgets, computers, internet, space technology, medical advances, and technological innovations."` |
| `createdAt` | Date | 26.7% | `{"$date":"2025-07-24T00:00:00Z"}` |
| `createdAt.$date` | String | 24.4% | `"2025-01-15T10:00:00.000Z"` |
| `description` | String | 100.0% | `"Word meanings, synonyms, antonyms, and usage."` |
| `name` | String | 100.0% | `"Vocabulary"` |
| `subjectId` | ObjectId | 100.0% | `{"$oid":"6881c73256cc49d262bb5e45"}` |
| `updatedAt.$date` | String | 24.4% | `"2025-01-15T10:00:00.000Z"` |

### Indexes
| Name | Keys (order) | Unique | TTL (s) | Partial Filter |
|---|---|:---:|:---:|---|
| `_id_` | `{"_id":1}` |  |  | `` |

### Sample document
```json
{"_id":{"$oid":"6881d59556cc49d262bb5e66"},"name":"Vocabulary","code":"vocabulary","subjectId":{"$oid":"6881c73256cc49d262bb5e45"},"classLevel":{"$numberInt":"5"},"chapterNumber":{"$numberInt":"12"},"description":"Word meanings, synonyms, antonyms, and usage.","createdAt":{"$date":{"$numberLong":"1753315200000"}}}
```

> Sampled 45 document(s).

---
