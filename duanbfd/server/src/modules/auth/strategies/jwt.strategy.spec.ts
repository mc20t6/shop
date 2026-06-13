import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  beforeEach(() => {
    strategy = new JwtStrategy({
      get: jest.fn().mockReturnValue('secret'),
    } as any);
  });

  it('nên giải mã payload thành công', () => {
    const payload = { sub: 1, email: 'test@gmail.com', role: 'admin' };
    expect(strategy.validate(payload)).toEqual({ userId: 1, email: 'test@gmail.com', role: 'admin' });
  });
});
