const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 기본 API 라우트
app.get('/api', (req, res) => {
  res.json({ message: 'Backend is running successfully!' });
});

// 프로덕션 환경(배포용) - 클라이언트 정적 파일 제공
if (process.env.NODE_ENV === 'production') {
  // frontend 빌드 폴더의 정적 파일을 제공하도록 설정
  const buildPath = path.join(__dirname, '../frontend/out'); // Next.js 빌드 방식 (next export에 따라 달라질 수 있음)
  app.use(express.static(buildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
