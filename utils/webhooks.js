const util = require('util');

class Feeds {
    /**
     * Feeds
     * @param {Object} options
     * @param {Logger} options.logger
     * @param {TurndownService} options.turndown
     * @param {Object} options.client
     * @param {Array} options.feeds
     */
    constructor(options) {
        this.logger = options.logger;
        this.td = options.turndown;
        this.client = options.client;
        this.feeds = options.feeds
    }

    /**
     * Executes the anime news network webhook
     * @param {Object} item
     * @return {Promise<void>}
     */
    async animenewsnetwork(item) {
        try {
            const feed = this.feeds.find((feed) => feed.name === 'Anime News Network');
            this.logger.info('item', `AnimeNewsNetwork: ${item.title}`);
            const newDesc = this.td.turndown(item.description);
            await this.client.executeWebhook(feed.id, feed.token, {
                username: feed.name,
                avatarURL: feed.avatar,
                embeds: [{
                    title: item.title,
                    url: item.link,
                    description: `**${item.categories.join(', ')}**\n${newDesc}`,
                    color: 0x90c030,
                    timestamp: item.date
                }]
            });
        } catch (e) {
            this.logger.error('webhook', util.inspect(e));
        }
    }

    /**
     * Executes the horriblesubs webhook
     * @param {Object} item
     * @return {Promise<void>}
     */
    async horriblesubs(item) {
        try {
            const feed = this.feeds.find((feed) => feed.name === 'HorribleSubs');
            this.logger.info('item', `HorribleSubs: ${item.title}`);

            let newDesc = this.td.turndown(item.description);
            newDesc = newDesc.split('|');
            const descPart1 = newDesc[0];
            const descPart2 = newDesc[1];
            newDesc.splice(0, 2);
            newDesc = newDesc.join('\n');

            await this.client.executeWebhook(feed.id, feed.token, {
                username: feed.name,
                avatarURL: feed.avatar,
                embeds: [{
                    title: item.title,
                    url: item.guid,
                    description: `${descPart1 + '|' + descPart2}\n${newDesc}`,
                    color: 0xfeffff,
                    fields: [
                        {name: 'Seeders', value: item['nyaa:seeders']['#'], inline: true},
                        {name: 'Leechers', value: item['nyaa:leechers']['#'], inline: true},
                        {name: 'Downloads', value: item['nyaa:downloads']['#'], inline: true}
                    ],
                    timestamp: item.date
                }]
            });
        } catch (e) {
            this.logger.error('webhook', util.inspect(e));
        }
    }

    /**
     * Executes the wowjapan webhook
     * @param {Object} item
     * @return {Promise<void>}
     */
    async wowjapan(item) {
        try {
            const feed = this.feeds.find((feed) => feed.name === 'WowJapan');
            this.logger.info('item', `WowJapan: ${item.title}`);
            let newDesc = this.td.turndown(item.summary);
            await this.client.executeWebhook(feed.id, feed.token, {
                username: feed.name,
                avatarURL: feed.avatar,
                embeds: [{
                    title: item.title,
                    url: item.link,
                    description: `**${item.categories.join(', ')}**\n${newDesc}`,
                    color: 0x00b0aa,
                    footer: {text: `Author: ${item.author}`},
                    timestamp: item.date
                }]
            });
        } catch (e) {
            this.logger.error('webhook', util.inspect(e));
        }
    }

    /**
     * Execute webhook for non-specific sources
     * @param {Object} item
     * @return {Promise<void>}
     */
    async unknown(item) {
        try {
            const feed = this.feeds.find((feed) => feed.name === 'Unknown');
            this.logger.info('item', `Unknown: ${item.title}`);
            let newDesc = this.td.turndown(item.description);
            await this.client.executeWebhook(feed.id, feed.token, {
                username: item.meta.title,
                avatarURL: feed.avatar,
                embeds: [{
                    title: item.title,
                    url: item.link,
                    description: `${item.categories && item.categories.length > 0 ? `**${item.categories.join(', ')}**\n` : ''}${newDesc}`,
                    color: 0xe9184e,
                    timestamp: item.date
                }]
            });
        } catch (e) {
            this.logger.error('webhook', util.inspect(e));
        }
    }
}

module.exports = Feeds;
