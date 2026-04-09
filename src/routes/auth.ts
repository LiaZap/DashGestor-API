import { Router, Request, Response } from 'express';
import { generateToken } from '../middleware/auth';

export const authRouter = Router();

// Simple in-memory users for now (replace with database)
const users: { id: string; email: string; password: string; name: string }[] = [
  { id: '1', email: 'admin@gestordash.com', password: 'admin123', name: 'Admin' },
];

authRouter.post('/login', (req: Request, res: Response): void => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    res.status(401).json({ error: 'Email ou senha inválidos' });
    return;
  }

  const token = generateToken(user.id);
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

authRouter.post('/register', (req: Request, res: Response): void => {
  const { email, password, name } = req.body;

  if (users.find(u => u.email === email)) {
    res.status(400).json({ error: 'Email já cadastrado' });
    return;
  }

  const newUser = { id: String(users.length + 1), email, password, name };
  users.push(newUser);

  const token = generateToken(newUser.id);
  res.json({
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email },
  });
});

authRouter.get('/me', (req: Request, res: Response): void => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ error: 'Não autenticado' });
    return;
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gestordash-secret-change-in-production') as { userId: string };
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
});
