const TurndownService = require('turndown');
const RssFeed = require('rss-feed-emitter');
const Eris = require('eris');
const Logger = require('./utils/Logger');
const Feeds = require('./utils/webhooks');
const config = require('./config');
const feeds = require('./feeds');

process.setMaxListeners(0);

const logger = new Logger(true, true, config.sentry.dsn);

const td = new TurndownService({
    headingStyle: 'atx',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '*'
});

// noinspection JSUnusedGlobalSymbols
td.addRule('cite', {
    filter: ['cite'],
    replacement: (content) => {
        return `*${content}*`;
    }
});

const client = new Eris();

const webhooks = new Feeds({
    logger: logger,
    turndown: td,
    client: client,
    feeds: feeds
});

const rssfeeds = new RssFeed();

feeds.forEach((feed) => {
    if (feed.name === 'Unknown' && feed.urls.length > 0) {
        feed.urls.forEach((url) => rssfeeds.add({url: url, refresh: feed.refresh}));
    } else {
        if (feed.name !== 'Unknown') rssfeeds.add({url: feed.url, refresh: feed.refresh});
    }
});

rssfeeds.on('new-item', async (item) => {
    if (process.uptime() < config.startDelay) return;

    const annCheck = item.meta.title.indexOf('Anime News Network') !== -1;
    const hsCheck = item.title.indexOf('HorribleSubs') !== -1;
    const wjCheck = item.meta.title.indexOf('WOWJAPAN') !== -1;

    if (annCheck) {
        await webhooks.animenewsnetwork(item);
    } else if (hsCheck) {
        if (item.title.indexOf('1080p') !== -1) await webhooks.horriblesubs(item);
    } else if (wjCheck) {
        await webhooks.wowjapan(item);
    } else {
        await webhooks.unknown(item);
    }
});

rssfeeds.on('error', (e) => {
    if (e.feed) {
        let feedName = e.feed;
        if (e.feed.indexOf('animenewsnetwork') !== -1) feedName = 'AnimeNewsNetwork';
        if (e.feed.indexOf('HorribleSubs') !== -1) feedName = 'HorribleSubs';
        if (e.feed.indexOf('Wowjapan') !== -1) feedName = 'WowJapan';

        logger.error('error', `${feedName}: ${e.message}`);
    } else {
        logger.error('error', e);
    }
});

process.on('uncaughtException', (e) => logger.error('error', e));
process.on('unhandledRejection', (e) => logger.error('error', e));

process.on('SIGINT', () => {
    logger.warn('close', 'Stopping listeners');
    rssfeeds.destroy();
    process.exit(0);
});

logger.init('open', 'Starting listeners');
logger.init('info', `Subscribed feeds:\n${rssfeeds.list().map((feed) => feed.url).join('\n')}`);
