function startTicker() {
  app.ticker.add(function(delta) {
    app.stage.children.sort(depthCompare);
    var totalMessages = app.stage.children.length - 1;
    var count = 0;
    for (var i = totalMessages; i >= 0; i--)
      count += app.stage.children[i].scale.x + 1;

    for (var i = totalMessages; i >= 0; i--) {
      var message = app.stage.children[i];
      var scale = message.scale.x + 1;

      // GROW OR SHRINK
      if (message.grow) {
        if (message.width < window.innerWidth - 10 && message.height < window.innerHeight - 10) {
          message.scale.x += (window.innerWidth + window.innerHeight) * .000001;
          message.scale.y += (window.innerWidth + window.innerHeight) * .000001;
        }
        message.grow--;
      } else {
        message.scale.x -= '.'.concat(pad(Math.round(count), 5)) * scale;
        message.scale.y -= '.'.concat(pad(Math.round(count), 5)) * scale;
      }

      // COLLISION
      for (var j = totalMessages; j >= 0; j--) {
        var otherMessage = app.stage.children[j];
        if (message.text == otherMessage.text) continue;
        if (collides(message, otherMessage)) {
          if (message.x <= otherMessage.x) // hit right
            message.vx += (-1 + message.x / otherMessage.x) * (otherMessage.scale.x + 1) / (scale * 10);
          else if (message.x > otherMessage.x) // hit left
            message.vx += (-1 + message.x / otherMessage.x) * (otherMessage.scale.x + 1) / (scale * 10);
          if (message.y <= otherMessage.y) // hit bottom
            message.vy += (-1 + message.y / otherMessage.y) * (otherMessage.scale.x + 1) / (scale * 10);
          else if (message.y > otherMessage.y) // hit top
            message.vy += (-1 + message.y / otherMessage.y) * (otherMessage.scale.x + 1) / (scale * 10);
          //break;
        }
      }

      // KEEP IN BOUNDS
      if (message.x - message.width / 2 < 0)
        message.vx += .1 * scale;
      if (message.x + message.width / 2 > window.innerWidth)
        message.vx -= .1 * scale;
      if (message.y - message.height / 3 < 0)
        message.vy += .1 * scale;
      if (message.y + message.height / 3 > window.innerHeight)
        message.vy -= .1 * scale;

      // SET NEW MAX VELOCITY
      message.maxVel = 25 / scale;

      // RESET VELOCITY TO MAX
      if (message.vx > message.maxVel)
        message.vx = message.maxVel;
      else if (message.vx < -message.maxVel)
        message.vx = -message.maxVel;
      if (message.vy > message.maxVel)
        message.vy = message.maxVel;
      else if (message.vy < -message.maxVel)
        message.vy = -message.maxVel;

      // APPLY VELOCITY
      message.x += message.vx;
      message.y += message.vy;

      // SLOW DOWN
      message.vx = lerp(message.vx, 0, .01 / scale);
      message.vy = lerp(message.vy, 0, .01 / scale);

      // REMOVE WHEN SCALE = 0
      if (message.scale.x <= 0) {
        message.destroy();
        totalMessages = app.stage.children.length - 1;
      }
    }
  });
}

function lerp(v0, v1, t) {
  return v0 * (1 - t) + v1 * t
}

function depthCompare(a, b) {
  if (a.scale.x < b.scale.x) return -1;
  if (a.scale.x > b.scale.x) return 1;
  return 0;
}

function collides(a, b) {
  var divideWidthBy = 2;
  var divideHeightBy = 3;
  return a.x - a.width / divideWidthBy < b.x + b.width / divideWidthBy &&
    a.x + a.width / divideWidthBy > b.x - b.width / divideWidthBy &&
    a.y - a.height / divideHeightBy < b.y + b.height / divideHeightBy &&
    a.y + a.height / divideHeightBy > b.y - b.height / divideHeightBy;
}

function pad(num, size) {
  var s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}
