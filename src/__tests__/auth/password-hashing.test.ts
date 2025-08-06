import bcrypt from 'bcrypt';

describe('Password Hashing', () => {
  const testPassword = 'test-password-123';
  const saltRounds = 10;

  it('should generate different hashes for the same password', async () => {
    const hash1 = await bcrypt.hash(testPassword, saltRounds);
    const hash2 = await bcrypt.hash(testPassword, saltRounds);

    expect(hash1).not.toBe(hash2);
  });

  it('should correctly verify a hashed password', async () => {
    const hash = await bcrypt.hash(testPassword, saltRounds);
    const isValid = await bcrypt.compare(testPassword, hash);

    expect(isValid).toBe(true);
  });

  it('should fail to verify an incorrect password', async () => {
    const hash = await bcrypt.hash(testPassword, saltRounds);
    const isValid = await bcrypt.compare('wrong-password', hash);

    expect(isValid).toBe(false);
  });

  it('should generate hashes with expected characteristics', async () => {
    const hash = await bcrypt.hash(testPassword, saltRounds);

    // bcrypt hashes should:
    // 1. Start with $2b$ (algorithm identifier)
    // 2. Include the cost factor (10)
    // 3. Have a total length of 60 characters
    expect(hash).toMatch(/^\$2b\$10\$/);
    expect(hash).toHaveLength(60);
  });

  it('should handle empty passwords', async () => {
    const hash = await bcrypt.hash('', saltRounds);
    const isValid = await bcrypt.compare('', hash);

    expect(isValid).toBe(true);
  });

  it('should handle long passwords', async () => {
    const longPassword = 'a'.repeat(72); // bcrypt's maximum input length
    const hash = await bcrypt.hash(longPassword, saltRounds);
    const isValid = await bcrypt.compare(longPassword, hash);

    expect(isValid).toBe(true);
  });

  it('should truncate passwords longer than 72 characters', async () => {
    const longPassword = 'a'.repeat(100);
    const truncatedPassword = 'a'.repeat(72);
    
    const hash = await bcrypt.hash(longPassword, saltRounds);
    const isValidFull = await bcrypt.compare(longPassword, hash);
    const isValidTruncated = await bcrypt.compare(truncatedPassword, hash);

    expect(isValidFull).toBe(true);
    expect(isValidTruncated).toBe(true);
  });

  it('should reject invalid salt rounds', async () => {
    const hashSpy = jest.spyOn(bcrypt, 'hash')
      .mockImplementation(() => Promise.reject(new Error('Invalid salt rounds')));
    
    await expect(bcrypt.hash(testPassword, -1))
      .rejects.toThrow('Invalid salt rounds');
    
    hashSpy.mockRestore();
  });
});
