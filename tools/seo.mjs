// Single source of truth for SEO, social (Open Graph / X) and AI-visibility metadata.
// Used by tools/build.mjs (head tags, JSON-LD, sitemap, robots, llms.txt) and tools/og.mjs (share images).
// Change SITE if the production domain changes; canonical URLs and share images follow it.
export const SITE = 'https://www.addton.io';
export const BRAND = 'AddTON DAO';
export const SOCIAL = { x: 'https://x.com/addtoncoin', telegram: 'https://t.me/add_toncoin', medium: 'https://medium.com/@addtondao', xHandle: '@addtoncoin' };

// parent: breadcrumb parent page · index:false → noindex + left out of sitemap
export const PAGES = {
  index: {
    title: 'AddTON DAO | Crypto Staking, AI Arbitrage & Layer 1',
    desc: 'One account for crypto staking, AI arbitrage, the Gram Chain Layer 1 and the GramPe wallet. Stake XLM, TON and 45+ coins with up to 250%+ APY on XLM.',
    name: 'Home', priority: 1.0, freq: 'weekly',
    keywords: 'AddTON, AddTON DAO, crypto staking, XLM staking, TON staking, ArbiEx, AI arbitrage bot, Gram Chain, GCC coin, wGCC, GramPe wallet',
    og: { label: 'One account for', num: 'DAO', lines: ['Real finance', 'Real participation'], stats: [['250%+', 'XLM APY*'], ['0.8s', 'Gram blocks'], ['45+', 'Coins']] },
  },
  products: {
    title: 'AddTON Products | Staking, ArbiEx, Gram Chain & GramPe',
    desc: 'Explore AddTON: XLM and multi-coin staking, the ArbiEx AI arbitrage bot, the Gram Chain Layer 1 with its GCC coin, and the GramPe crypto wallet app.',
    name: 'Products', priority: 0.9, freq: 'monthly',
    keywords: 'AddTON products, crypto staking platform, AI trading bot, Layer 1 blockchain, crypto wallet app',
    og: { label: 'Products', num: '04', lines: ['One platform,', 'four ways to grow'], stats: [['Staking', '45+ coins'], ['ArbiEx', 'AI bot'], ['GramPe', 'Wallet']], size: 70 },
  },
  staking: {
    title: 'Stake XLM & Earn Up to 250%+ APY | AddTON Staking',
    desc: 'Stake Stellar XLM, Rental Wallet Coin, TON and 45+ coins in transparent vaults. Earn up to 250%+ APY on XLM with compounding rewards.',
    name: 'Staking', parent: 'products', priority: 0.9, freq: 'weekly',
    keywords: 'XLM staking, stake Stellar, TON staking, Rental Wallet Coin, crypto staking APY, compounding staking rewards',
    og: { label: 'Staking', num: 'XLM', lines: ['Stake XLM and', 'watch it grow'], stats: [['250%+', 'Vault APY*'], ['45+', 'Coins'], ['6+', 'Chains']], coin: 'XLM', coinLabel: 'VAULT' },
  },
  arbiex: {
    title: 'ArbiEx AI Arbitrage Bot | Automated Crypto Trading | AddTON',
    desc: 'ArbiEx is an AI staking bot that trades price gaps between DEX pools and tier-1 exchanges 24/7, averaging +5% profit. Stake once and let AI trade.',
    name: 'ArbiEx', parent: 'products', priority: 0.9, freq: 'monthly',
    keywords: 'ArbiEx, AI arbitrage bot, crypto arbitrage, DEX CEX arbitrage, automated crypto trading',
    og: { label: 'AI staking bot', num: '24/7', lines: ['AI arbitrage that', 'works while you sleep'], stats: [['+5%', 'Avg profit*'], ['24/7', 'Automated'], ['DEX⇄CEX', 'Route']], size: 66 },
  },
  'gram-chain': {
    title: 'Gram Chain & GCC Coin | Fast Layer 1 Blockchain | AddTON',
    desc: 'Gram Chain is a Layer 1 blockchain with Proof of Authority and 0.8s blocks. GCC is its native coin, with exchange listing soon and wGCC on BNB Smart Chain.',
    name: 'Gram Chain & GCC', parent: 'products', priority: 0.9, freq: 'weekly',
    keywords: 'Gram Chain, GCC coin, wGCC, Proof of Authority blockchain, Layer 1, BNB Smart Chain, GCC exchange listing',
    og: { label: 'Layer 1 blockchain', num: 'PoA', lines: ['Gram Chain,', 'powered by GCC'], stats: [['0.8s', 'Block time'], ['PoA', 'Consensus'], ['33.8B', 'GCC supply']], coin: 'GCC', coinLabel: 'GRAM CHAIN' },
  },
  grampe: {
    title: 'GramPe Crypto Wallet App | Send, Swap & Spend | AddTON',
    desc: 'GramPe is a crypto wallet app to send, receive and swap XLM, TON, GCC, USDT and more, with a RuPay debit card for everyday spending.',
    name: 'GramPe', parent: 'products', priority: 0.8, freq: 'monthly',
    keywords: 'GramPe, crypto wallet app, RuPay crypto card, send and swap crypto, TON wallet, XLM wallet',
    og: { label: 'Crypto wallet app', num: 'RuPay', lines: ['GramPe, your', 'everyday wallet'], stats: [['Send', '& receive'], ['Swap', 'In-app'], ['RuPay', 'Debit card']] },
  },
  opportunities: {
    title: 'Earn More with AddTON | Helping, Airdrop & Play to Earn',
    desc: 'More ways to earn with AddTON: Helping, our help-to-earn concept, the AddTON airdrop and Play to Earn crypto games, coming soon.',
    name: 'Opportunities', priority: 0.7, freq: 'monthly',
    keywords: 'earn crypto, AddTON opportunities, help to earn, crypto airdrop, play to earn',
    og: { label: 'Opportunities', num: '+', lines: ['More ways', 'to earn'], stats: [['Helping', 'Live'], ['Airdrop', 'Live'], ['P2E', 'Soon']] },
  },
  helping: {
    title: 'AddTON Helping | Help to Earn Passive Income',
    desc: "Helping is AddTON's help-to-earn concept: support members of the community and build passive earnings, all tracked in your dashboard.",
    name: 'Helping', parent: 'opportunities', priority: 0.7, freq: 'monthly',
    keywords: 'AddTON Helping, help to earn, passive crypto income, community earning',
    og: { label: 'Help to earn', num: 'Live', lines: ['Help others,', 'earn passively'], stats: [['Help', 'Community'], ['Earn', 'Passively'], ['Track', 'Dashboard']] },
  },
  airdrop: {
    title: 'AddTON Airdrop | Earn Crypto for Social Tasks & Content',
    desc: 'Join the AddTON airdrop: follow, like and comment on X, Telegram, Medium and Facebook, make YouTube videos or write articles, and earn rewards.',
    name: 'Airdrop', parent: 'opportunities', priority: 0.8, freq: 'weekly',
    keywords: 'AddTON airdrop, crypto airdrop, earn crypto social tasks, YouTube creator rewards, crypto article rewards',
    og: { label: 'AddTON airdrop', num: 'Live', lines: ['Spread the word.', 'Earn the airdrop.'], stats: [['4', 'Platforms'], ['YouTube', 'Creators'], ['Articles', 'Writers']], size: 70 },
  },
  'play-to-earn': {
    title: 'Play to Earn Crypto Games | Coming Soon | AddTON',
    desc: 'Play games and earn crypto. AddTON Play to Earn is coming in a future update, with rewards sent straight to your AddTON wallet.',
    name: 'Play to Earn', parent: 'opportunities', priority: 0.6, freq: 'monthly',
    keywords: 'play to earn, crypto games, earn crypto playing games, AddTON games',
    og: { label: 'Coming soon', num: 'P2E', lines: ['Play games.', 'Earn crypto.'], stats: [['Play', 'Games'], ['Earn', 'Rewards'], ['Soon', 'Update']] },
  },
  signup: {
    title: 'Create Your AddTON Account | Sign Up with Sponsor ID',
    desc: 'Join AddTON DAO with your Sponsor ID to stake XLM, use the ArbiEx AI bot, join the airdrop and start earning on one platform.',
    name: 'Create account', priority: 0.6, freq: 'yearly',
    og: { label: 'Create account', num: '3 steps', lines: ['Join AddTON'], stats: [['45+', 'Coins'], ['250%+', 'XLM APY*'], ['+5%', 'ArbiEx avg*']], size: 92 },
  },
  login: {
    title: 'Log In to AddTON | Staking & Rewards Dashboard',
    desc: 'Log in to AddTON to manage your XLM staking, ArbiEx bot, airdrop rewards, Helping earnings and GramPe wallet.',
    name: 'Log in', index: false,
  },
  'forgot-password': {
    title: 'Reset Your Password | AddTON',
    desc: 'Forgot your AddTON password? Enter your account User ID and follow the password recovery instructions.',
    name: 'Reset password', index: false,
  },
  404: {
    title: 'Page not found | AddTON',
    desc: 'This page could not be found. Explore AddTON staking, ArbiEx, Gram Chain and GramPe from the home page.',
    name: 'Not found', index: false,
  },
};

export const url = page => SITE + (page === 'index' ? '/' : `/${page}.html`);
export const ogImage = page => `${SITE}/assets/img/og/${PAGES[page] && PAGES[page].og ? page : 'index'}.png`;
