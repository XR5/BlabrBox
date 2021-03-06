function Chat(message) {
  this.message = message;
  this.container = new PIXI.Sprite();
  this.container.text = message;
  this.grow = growAmount;
  this.count = 0;
  this.container.vx = 0;
  this.container.vy = 0;
  this.container.x = app.renderer.width * Math.random();
  this.container.y = app.renderer.height * Math.random();
  this.width = 0;
  this.height = 0;

  // FORCE PROPER DIMENSIONS
  var dimensionPlaceholder = new PIXI.Text(' ', style);
  this.container.addChild(dimensionPlaceholder);
  let width = 0;
  let height = Math.round(this.container.getBounds().height);

  // PARSE MESSAGE
  // INSERT EMOTES
  var messageArray = message.split(' ');
  var emoteFound = false;
  for (var i = 0, len = messageArray.length; i < len; i++) {
    var meme = false;
    for (var k in memes)
      if (RegExp("^" + k + "$").test(messageArray[i])) {
        meme = memes[k];
        break;
      }

    if (meme) {
      var url;
      var scale = 1;
      if ('u' in meme)
        url = meme.u;
      else {
        url = "https://static-cdn.jtvnw.net/emoticons/v1/" + meme.i + "/3.0";
        scale = 3;
      }
      var emote = new PIXI.Sprite.from(url);
      if ('h' in meme) memeHeight = meme.h * scale;
      else memeHeight = 28 * scale;
      if ('w' in meme) memeWidth = meme.w * scale;
      else memeWidth = 28 * scale;
      emote.width = height / memeHeight * memeWidth * .575;
      emote.height = height / memeHeight * memeHeight * .575;
      if (i > 0)
        emote.x = this.container.getBounds().width;
      emote.anchor.set(0, .5);
      emote.y = height / 2;
      this.container.addChild(emote);
      emoteFound = true;
    } else {
      if (!emoteOnly) {
        var word = new PIXI.Text(messageArray[i], style);
        word.x = i == 0 ? 0 : this.container.getBounds().width;
        this.container.addChild(word);
      }
    }

    // ADD SPACES IF ADDITIONAL WORD
    if (i + 1 < len) {
      var space = new PIXI.Text(' ', style);
      space.x = this.container.getBounds().width;
      this.container.addChild(space);
    }
  }

  if (emoteOnly && !emoteFound) {
    delete messages[message];
    this.container.destroy({
      children: true,
      baseTexture: true
    });
    return;
  }

  // MANUALLY SET ANCHOR TO .5
  width = this.container.getBounds().width;
  height = this.container.getBounds().height;
  for (var i = 0, len = this.container.children.length; i < len; i++) {
    this.container.children[i].x -= width / 2;
    this.container.children[i].y -= height / 2;
  }

  this.initWidth = width;
  this.initHeight = height * .58;

  this.container.scale.x = 0;
  this.container.scale.y = 0;

  messages[message] = this;
  chatContainer.addChildAt(this.container, 0);
}

Chat.prototype.setX = function (x) {
  this.container.x = x;
}

Chat.prototype.setY = function (y) {
  this.container.y = y;
}

Chat.prototype.getX = function () {
  return this.container.x;
}

Chat.prototype.getY = function () {
  return this.container.y;
}

Chat.prototype.setVX = function (vx) {
  this.container.vx = vx;
}

Chat.prototype.setVY = function (vy) {
  this.container.vy = vy;
}

Chat.prototype.getVX = function (vx) {
  return this.container.vx;
}

Chat.prototype.getVY = function (vy) {
  return this.container.vy;
}

Chat.prototype.getWidth = function () {
  return this.container.getBounds(true).width;
}

Chat.prototype.getHeight = function () {
  return this.container.getBounds(true).height * .6;
}

Chat.prototype.setDimensions = function () {
  //this.width = this.getWidth();
  //this.height = this.getHeight();
  this.width = this.initWidth * this.getScale();
  this.height = this.initHeight * this.getScale();
}

Chat.prototype.applyVelocity = function (delta) {
  let speedX = (this.getVX() * (1 - this.getHeight() / window.innerHeight));
  let speedY = (this.getVY() * (1 - this.getHeight() / window.innerHeight));
  speedX = Math.abs(speedX) > maxSpeed ? maxSpeed * Math.sign(speedX) : speedX;
  speedY = Math.abs(speedY) > maxSpeed ? maxSpeed * Math.sign(speedY) : speedY;
  this.setX(this.getX() + speedX * delta);
  this.setY(this.getY() + speedY * delta);
}

Chat.prototype.slowDown = function (delta) {
  this.setVX(lerp(this.getVX(), 0, 1 - brakeSpeed ** delta));
  this.setVY(lerp(this.getVY(), 0, 1 - brakeSpeed ** delta));
}

Chat.prototype.collision = function (delta) {
  for (var i = chatContainer.children.length - 1; i >= 0; i--) {
    if (this.message == chatContainer.children[i].text) continue;
    var other = messages[chatContainer.children[i].text];
    if (typeof other === 'undefined') continue;
    if (!this.checkCollide(this, other)) continue;
    this.setVY(this.getVY() + ((this.getY() - other.getY()) * collisionSpeed * 2) * delta);
    this.setVX(this.getVX() + ((this.getX() - other.getX()) * collisionSpeed) * delta);
    break;
  }
}

Chat.prototype.checkCollide = function (r1, r2) {
  var dx = r1.getX() - r2.getX();
  var dy = r1.getY() - r2.getY();
  var width = (r1.width + r2.width) / 2;
  var height = (r1.height + r2.height) / 2;
  return Math.abs(dx) <= width && Math.abs(dy) <= height;
}

Chat.prototype.keepInBounds = function (delta) {
  this.setVX(this.getVX() - (this.inBoundsX() * boundarySpeed) * delta);
  this.setVY(this.getVY() - (this.inBoundsY() * boundarySpeed) * delta);
}

Chat.prototype.inBoundsX = function (x, width) {
  if (this.getX() - this.width / 2 < 0) return this.getX() - this.width / 2;
  else if (this.getX() + this.width / 2 > app.renderer.width) return this.getX() + this.width / 2 - app.renderer.width;
  return 0;
}

Chat.prototype.inBoundsY = function (y, height) {
  if (this.getY() - this.height / 2 < 0) return this.getY() - this.height / 2;
  else if (this.getY() + this.height / 2 > app.renderer.height) return this.getY() + this.height / 2 - app.renderer.height;
  return 0;
}

Chat.prototype.getScale = function () {
  return this.container.scale.x;
}

Chat.prototype.addGrow = function () {
  this.grow += growAmount * scale;
  this.count++;
}

Chat.prototype.applyGrow = function (delta, count) {
  if (this.width > app.renderer.width - 10 || this.height > app.renderer.height - 10 || this.grow < 0)
    this.grow = 0;
  if (this.grow == 0)
    this.container.height = this.container.width += (-decaySpeed - this.getScale() * .002 - count * .001) * delta;
  else
    this.container.height = this.container.width += (growSpeed - this.getScale() * .002) * delta;
  if (this.grow > 0)
    this.grow--;
}

Chat.prototype.checkRemove = function () {
  if (this.getScale() <= .05) {
    delete messages[this.message];
    this.container.destroy({
      children: true,
      baseTexture: true
    });
    return true;
  }
  return false;
}

/*
Chat.prototype.collision = function (delta) {
  var thisInfo = {
    x: this.getX(),
    y: this.getY(),
    h: this.getHeight(),
    w: this.getWidth(),
    vx: this.getVX(),
    vy: this.getVY()
  };
  var overlap = 0;
  for (var i = chatContainer.children.length - 1; i >= 0; i--) {
    if (this.message == chatContainer.children[i].text) continue;
    var other = messages[chatContainer.children[i].text];
    if (typeof other === 'undefined') continue;
    var otherInfo = {
      x: other.getX(),
      y: other.getY(),
      h: other.getHeight(),
      w: other.getWidth()
    };

    var side = this.checkCollide(thisInfo, otherInfo);
    if (side == 'none') continue;
    var weight = collisionSpeed * ((otherInfo.h * otherInfo.w) / (thisInfo.h * thisInfo.w));
    if (side == 'top')
      this.setVY(thisInfo.vy + weight);
    else if (side == 'bottom')
      this.setVY(thisInfo.vy - weight);
    else if (side == 'left')
      this.setVX(thisInfo.vx + weight);
    else if (side == 'right')
      this.setVX(thisInfo.vx - weight);
    break;
  }
}

Chat.prototype.checkCollide = function (r1, r2) {
  var dx = r1.x - r2.x;
  var dy = r1.y - r2.y;
  var width = (r1.w + r2.w) / 2;
  var height = (r1.h + r2.h) / 2;
  var crossWidth = width * dy;
  var crossHeight = height * dx;
  var collision = 'none';
  if (Math.abs(dx) <= width && Math.abs(dy) <= height) {
    if (crossWidth > crossHeight) {
      if (crossWidth > (-crossHeight)) collision = 'top';
      else collision = 'right';
    } else {
      if (crossWidth > -(crossHeight)) collision = 'left';
      else collision = 'bottom';
    }
  }
  return (collision);
}
*/