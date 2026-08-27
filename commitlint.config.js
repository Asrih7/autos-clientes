module.exports = {
  extends: ['@commitlint/config-conventional'],
  ignores: [(commit) => /^[a-z]+(\(.+\))?: Merge /i.test(commit) || commit.startsWith('Merge')],
};
