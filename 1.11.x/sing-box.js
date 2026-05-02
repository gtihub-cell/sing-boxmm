const { type, name } = $arguments;

const compatible_outbound = { tag: 'COMPATIBLE', type: 'direct' };
let compatible = false;

let config = JSON.parse($files[0]);
let proxies = await produceArtifact({
    name,
    type: /^1$|col/i.test(type) ? 'collection' : 'subscription',
    platform: 'sing-box',
    produceType: 'internal',
});

config.outbounds.push(...proxies);

function getTags(proxies, regex) {
    return (regex ? proxies.filter(p => regex.test(p.tag)) : proxies).map(p => p.tag);
}

function getFirstSelectorTag(proxies) {
    const selectorProxy = proxies.find(p => p.type === 'selector');
    return selectorProxy ? selectorProxy.tag : null;
}

const firstSelectorTag = getFirstSelectorTag(proxies);

config.outbounds.map(i => {
    if (['all', 'all-auto'].includes(i.tag)) {
        i.outbounds.push(...getTags(proxies));
    }
    if (['hk', 'hk-auto'].includes(i.tag)) {
        i.outbounds.push(...getTags(proxies, /港|hk|hongkong|hong kong/i));
    }
    if (['tw', 'tw-auto'].includes(i.tag)) {
        i.outbounds.push(...getTags(proxies, /台|tw|taiwan/i));
    }
    if (['jp', 'jp-auto'].includes(i.tag)) {
        i.outbounds.push(...getTags(proxies, /日本|jp|japan/i));
    }
    if (['sg', 'sg-auto'].includes(i.tag)) {
        i.outbounds.push(...getTags(proxies, /^(?!.*(?:us)).*(新|sg|singapore)/i));
    }
    if (['us', 'us-auto'].includes(i.tag)) {
        i.outbounds.push(...getTags(proxies, /美|us|unitedstates|united states/i));
    }
    if (['Netflix', 'Netflix-auto'].includes(i.tag)) {
        i.outbounds.push(...getTags(proxies, /nf|netflix/i));
    }
    if (['Disney', 'Disney-auto'].includes(i.tag)) {
        i.outbounds.push(...getTags(proxies, /disney|disneyplus/i));
    }
    if (['Youtube', 'Youtube-auto'].includes(i.tag)) {
        i.outbounds.push(...getTags(proxies, /youtube|google/i));
    }
    if (['Spotify', 'Spotify-auto'].includes(i.tag)) {
        i.outbounds.push(...getTags(proxies, /spotify/i));
    }
    if (['OpenAI', 'OpenAI-auto'].includes(i.tag)) {
        i.outbounds.push(...getTags(proxies, /openai|chatgpt/i));
    }
    if (['Telegram', 'Telegram-auto'].includes(i.tag)) {
        i.outbounds.push(...getTags(proxies, /telegram|tg/i));
    }
    if (['my_selector'].includes(i.tag) && firstSelectorTag) {
        i.outbounds.push(firstSelectorTag);
    }
});

config.outbounds.forEach(outbound => {
    if (Array.isArray(outbound.outbounds) && outbound.outbounds.length === 0) {
        if (!compatible) {
            config.outbounds.push(compatible_outbound);
            compatible = true;
        }
        outbound.outbounds.push(compatible_outbound.tag);
    }
});

$content = JSON.stringify(config, null, 2);
