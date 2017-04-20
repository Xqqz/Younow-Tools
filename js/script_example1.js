/*

    sample script to filtering live broadcast (sandboxed : only javascript code & no network/disk access)

*/
function main() {
    /*
        1st pass : include a tag yes or no

        param : tag=TagInfo

            tag.tag:tagname
            tag.score:tag ranking

        return : true or false
    */
    if (tag) {
        if (tag.tag.match(/(turkish|arab|kuwait|guys)/)) {
            return false; // ignore this tag
        }
        else {
            return true; // load tag
        }
    }
    else if (user) {
        if (user.profile.match(/(michael.jackson)/) ||
            user.userId == 12345678) {
            return "follow";
        }
        else if (user.l.match(/(me|tr)/)) {
            return "ignore";
        }
        else if (!broadcast && user.viewers > 50) {
            return "resolve"; // request UserBroadcastInfo
        }
        else if (broadcast) {
            if (broadcast.country.match(/(OM|JO|EG|PK|PH|RO|TR|KW|SA|MA|TN)/)) {
                return "ignore";
            }
            else if (broadcast.country.match(/(US|GB|UK|IE)/) && user.viewers > 50) {
                return "follow";
            }
            else if (broadcast.broadcastsCount > 20) {
                return "ignore";
            }
            else if (broadcast.comments.length) {
                for (let comment of broadcast.comments) {
                    if (comment.comment.match(/(funny|hilarious|tremendous)/i)) {
                        log("comment.comment");
                        return "follow";
                    }
                }
            }
            else {
                return "waiting";
            }
        }
        else {
            return "waiting";
        }
    }
}
try {
    main();
}
catch (e) {
    e;
}
