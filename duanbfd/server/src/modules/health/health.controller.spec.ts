import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(() => { controller = new HealthController(); });

  it('Trả về status OK', () => {
    expect(controller.checkHealth()).toEqual(expect.objectContaining({ status: 'OK' }));
  });
});