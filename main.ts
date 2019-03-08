enum SpriteKind {
    Player,
    Projectile,
    Food,
    Enemy,
    Bumper,
    Goal,
    Coin
}

enum ActionKind {
    RunningLeft,
    RunningRight,
    Idle,
    IdleLeft,
    IdleRight,
    JumpingLeft,
    JumpingRight,
    CrouchLeft,
    CrouchRight
}

let hero = sprites.create(img`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . e e e e e e e e e . . .
    . . . e e e e e e e e e e . . .
    . . . e e e e e e e e e e . . .
    . . . d e e d d d d d d d . . .
    . . . d e d d f d d d f d . . .
    . . . e d d d f d d d f d . . .
    . . . . d d d d d d d d d . . .
    . . . . d d d d 1 1 d d d . . .
    . . . . a a c c c c c c a . . .
    . . . . d d c c c c c c d . . .
    . . . . d d f f f 9 f f d . . .
    . . . . a a a a a a a a . . . .
    . . . . . a a . . a a . . . . .
    . . . . . e e . . e e . . . . .
`, SpriteKind.Player)
let coinAnimation: animation.Animation = null;
// how long to pause between each contact with a
// single enemy
let invincibilityPeriod = 500
let pixelsToMeters = 30
let canDoubleJump = false
let gravity = 9.81 * pixelsToMeters

let currentLevel = 0
let heroFacingLeft = false;
let levelMaps = [
    img`
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . 5 . . . . . . . . . . . . . . . . . . . . . . .
        . . . . 5 . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . 5 . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . 6 . . 5 . 6 . . . . . . . . . . . . . . . . . 6
        . 1 . . 6 . . . 7 . 2 . . 7 . . . 2 6 . 2 . . 2 . 6 . e . . . 7
        f f f f 7 f f f 7 f f f f 7 f f f f 7 f f f f f f 7 f f f f f 7
    `,
    img`
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . 6 . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . 6 5 7 . . . . . . . . . .
        . . . . . . . 6 6 . 6 . . . . . . 6 . 7 5 7 . . . . . . . . . .
        . . . . . . 6 7 7 . 7 . . . . 6 . 7 . 7 5 7 . . . . . . . . . .
        6 . . . . 6 7 7 7 . 7 . . 6 . 7 5 7 5 7 5 7 . . . 5 5 5 5 5 5 5
        7 1 . . . . . . 2 . 7 . . 7 . 2 . . . 2 5 7 . . . . . . . . e .
        f f f f f f f f f f 7 f f f f f f f f f f 7 f f f f f f f f f f
    `,
    img`
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . 6 6 6 6 6 6 . . . . . . . . . . . . . . . .
        . . . . . . . . 6 . 7 . 5 5 5 . . . . . . . . . . . . . . 5 5 5
        . . . . . 6 . . 7 . 7 . 5 5 5 . . . . . . . . . . . . . . 5 5 5
        . 1 . 6 . 7 . 2 2 . 7 . 5 5 5 . . . . . . . . . e . . . . 5 5 5
        f f f 7 f 7 f f f f 7 f f f f f f f f f f f f f f f f f f f f f
    `
]

initializeAnimations()
initializeScene()
createPlayer(hero)
initializeLevel(currentLevel)

function initializeAnimations() {
    initializeHeroAnimations();
    initializeCoinAnimation();
}

function initializeHeroAnimations() {
    let mainRunLeft = animation.createAnimation(ActionKind.RunningLeft, 100)
    animation.attachAnimation(hero, mainRunLeft)
    mainRunLeft.addAnimationFrame(img`
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 E E E E E E E 0 0 0 0 0 0
        0 0 E E E E E E E E E 0 0 0 0 0
        0 0 D D D D E D D E E 0 0 0 0 0
        0 0 D D F D D E D E E 0 0 0 0 0
        0 0 D D F D D D E E E 0 0 0 0 0
        0 0 D D F D D D D D D 0 0 0 0 0
        0 0 D D D D D D D D D 0 0 0 0 0
        0 0 0 C C C A A C C B 0 0 0 0 0
        0 0 0 C C D D D C C B 0 0 0 0 0
        0 0 0 B F F D D F F F 0 0 0 0 0
        0 0 0 A A A A A A A B 0 0 0 0 0
        0 0 0 0 A A A A B 0 0 0 0 0 0 0
        0 0 0 0 A A A A B 0 0 0 0 0 0 0
        0 0 0 0 F F F F F 0 0 0 0 0 0 0
    `)
    mainRunLeft.addAnimationFrame(img`
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 E E E E E E E 0 0 0 0 0 0
        0 0 E E E E E E E E E 0 0 0 0 0
        0 0 D D D D E D D E E 0 0 0 0 0
        0 0 D D F D D E D E E 0 0 0 0 0
        0 0 D D F D D D E E E 0 0 0 0 0
        0 0 D D F D D D D D D 0 0 0 0 0
        0 0 D D D D D D D D D 0 0 0 0 0
        0 0 0 C C C C A A C B 0 0 0 0 0
        0 0 0 C C C C D D C B 0 0 0 0 0
        0 0 0 B F F D D D F F 0 0 0 0 0
        0 0 0 A A A A A A A A B F 0 0 0
        0 0 0 0 A A B 0 0 A A A F 0 0 0
        0 0 0 0 F F F 0 0 0 0 F 0 0 0 0
    `)
    mainRunLeft.addAnimationFrame(img`
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 E E E E E E E 0 0 0 0 0 0
        0 0 E E E E E E E E E 0 0 0 0 0
        0 0 D D D D E D D E E 0 0 0 0 0
        0 0 D D F D D E D E E 0 0 0 0 0
        0 0 D D F D D D E E E 0 0 0 0 0
        0 0 D D F D D D D D D 0 0 0 0 0
        0 0 D D D D D D D D D 0 0 0 0 0
        0 0 0 C C C A A C C B 0 0 0 0 0
        0 0 0 C C D D D C C B 0 0 0 0 0
        0 0 0 B F F D D F F F 0 0 0 0 0
        0 0 0 A A A A A A A B 0 0 0 0 0
        0 0 0 0 A A A A B 0 0 0 0 0 0 0
        0 0 0 0 A A A A B 0 0 0 0 0 0 0
        0 0 0 0 F F F F F 0 0 0 0 0 0 0
    `)
    mainRunLeft.addAnimationFrame(img`
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 E E E E E E E 0 0 0 0 0 0
        0 0 E E E E E E E E E 0 0 0 0 0
        0 0 D D D D E D D E E 0 0 0 0 0
        0 0 D D F D D E D E E 0 0 0 0 0
        0 0 D D F D D D E E E 0 0 0 0 0
        0 0 D D F D D D D D D 0 0 0 0 0
        0 0 D D D D D D D D D 0 0 0 0 0
        0 0 0 C A A C C C C B 0 0 0 0 0
        0 0 D D D B C C C C B 0 0 0 0 0
        0 F 0 D D F F F F F F 0 0 0 0 0
        0 F F A A A A A A A B 0 0 0 0 0
        0 F A A B 0 A A B 0 0 0 0 0 0 0
        0 0 0 0 0 0 F F F 0 0 0 0 0 0 0
    `)

    let mainRunRight = animation.createAnimation(ActionKind.RunningRight, 100)
    animation.attachAnimation(hero, mainRunRight)
    mainRunRight.addAnimationFrame(img`
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 0 0 0 E E E E E E E 0 0 0
        0 0 0 0 0 E E E E E E E E E 0 0
        0 0 0 0 0 E E D D E D D D D 0 0
        0 0 0 0 0 E E D E D D F D D 0 0
        0 0 0 0 0 E E E D D D F D D 0 0
        0 0 0 0 0 D D D D D D F D D 0 0
        0 0 0 0 0 D D D D D D D D D 0 0
        0 0 0 0 0 B C C A A C C C 0 0 0
        0 0 0 0 0 B C C D D D C C 0 0 0
        0 0 0 0 0 F F F D D F F B 0 0 0
        0 0 0 0 0 B A A A A A A A 0 0 0
        0 0 0 0 0 0 0 B A A A A 0 0 0 0
        0 0 0 0 0 0 0 B A A A A 0 0 0 0
        0 0 0 0 0 0 0 F F F F F 0 0 0 0
    `)
    mainRunRight.addAnimationFrame(img`
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 0 0 0 E E E E E E E 0 0 0
        0 0 0 0 0 E E E E E E E E E 0 0
        0 0 0 0 0 E E D D E D D D D 0 0
        0 0 0 0 0 E E D E D D F D D 0 0
        0 0 0 0 0 E E E D D D F D D 0 0
        0 0 0 0 0 D D D D D D F D D 0 0
        0 0 0 0 0 D D D D D D D D D 0 0
        0 0 0 0 0 B C A A C C C C 0 0 0
        0 0 0 0 0 B C D D C C C C 0 0 0
        0 0 0 0 0 F F D D D F F B 0 0 0
        0 0 0 F B A A A A A A A A 0 0 0
        0 0 0 F A A A 0 0 B A A 0 0 0 0
        0 0 0 0 F 0 0 0 0 F F F 0 0 0 0
    `)
    mainRunRight.addAnimationFrame(img`
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 0 0 0 E E E E E E E 0 0 0
        0 0 0 0 0 E E E E E E E E E 0 0
        0 0 0 0 0 E E D D E D D D D 0 0
        0 0 0 0 0 E E D E D D F D D 0 0
        0 0 0 0 0 E E E D D D F D D 0 0
        0 0 0 0 0 D D D D D D F D D 0 0
        0 0 0 0 0 D D D D D D D D D 0 0
        0 0 0 0 0 B C C A A C C C 0 0 0
        0 0 0 0 0 B C C D D D C C 0 0 0
        0 0 0 0 0 F F F D D F F B 0 0 0
        0 0 0 0 0 B A A A A A A A 0 0 0
        0 0 0 0 0 0 0 B A A A A 0 0 0 0
        0 0 0 0 0 0 0 B A A A A 0 0 0 0
        0 0 0 0 0 0 0 F F F F F 0 0 0 0
    `)
    mainRunRight.addAnimationFrame(img`
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 0 0 0 E E E E E E E 0 0 0
        0 0 0 0 0 E E E E E E E E E 0 0
        0 0 0 0 0 E E D D E D D D D 0 0
        0 0 0 0 0 E E D E D D F D D 0 0
        0 0 0 0 0 E E E D D D F D D 0 0
        0 0 0 0 0 D D D D D D F D D 0 0
        0 0 0 0 0 D D D D D D D D D 0 0
        0 0 0 0 0 B C C C C A A C 0 0 0
        0 0 0 0 0 B C C C C B D D D 0 0
        0 0 0 0 0 F F F F F F D D 0 F 0
        0 0 0 0 0 B A A A A A A A F F 0
        0 0 0 0 0 0 0 B A A 0 B A A F 0
        0 0 0 0 0 0 0 F F F 0 0 0 0 0 0
    `)

    /** idle **/
    let mainIdleLeft = animation.createAnimation(ActionKind.IdleLeft, 100);
    animation.attachAnimation(hero, mainIdleLeft)
    mainIdleLeft.addAnimationFrame(img`
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 E E E E E E E E E E 0 0 0
        0 0 E E E E E E E E E E E E 0 0
        0 0 D D D D D D D D D E E D 0 0
        0 0 D D F D D D D F D D E D 0 0
        0 0 D D F D D D D F D D D E 0 0
        0 0 D D F D D D D F D D D 0 0 0
        0 0 D D D D D D D D D D D 0 0 0
        0 0 A C C C C C C C C A B 0 0 0
        0 0 D D C C C C C C D D D 0 0 0
        0 0 D F F F B B F F F D D 0 0 0
        0 0 0 A A A A A A A A A B 0 0 0
        0 0 0 0 A A B 0 0 A A B 0 0 0 0
        0 0 0 0 A A B 0 0 A A B 0 0 0 0
        0 0 0 0 F F F 0 0 F F F 0 0 0 0
    `);

    let mainIdleRight = animation.createAnimation(ActionKind.IdleRight, 100);
    animation.attachAnimation(hero, mainIdleRight)
    mainIdleRight.addAnimationFrame(img`
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 E E E E E E E E E E 0 0 0
        0 0 E E E E E E E E E E E E 0 0
        0 0 D E E D D D D D D D D D 0 0
        0 0 D E D D F D D D D F D D 0 0
        0 0 E D D D F D D D D F D D 0 0
        0 0 0 D D D F D D D D F D D 0 0
        0 0 0 D D D D D D D D D D D 0 0
        0 0 0 B A C C C C C C C C A 0 0
        0 0 0 D D D C C C C C C D D 0 0
        0 0 0 D D F F F B B F F F D 0 0
        0 0 0 B A A A A A A A A A 0 0 0
        0 0 0 0 B A A 0 0 B A A 0 0 0 0
        0 0 0 0 B A A 0 0 B A A 0 0 0 0
        0 0 0 0 F F F 0 0 F F F 0 0 0 0
    `);

    /** crouch */

    let mainCrouchLeft = animation.createAnimation(ActionKind.CrouchLeft, 100);
    animation.attachAnimation(hero, mainCrouchLeft);
    mainCrouchLeft.addAnimationFrame(img`
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 E E E E E E E E E E 0 0 0
        0 0 E E E E E E E E E E E E 0 0
        0 0 D D D D D D D D D E E D 0 0
        0 0 D D F D D D D F D D E D 0 0
        0 0 D D F D D D D F D D D E 0 0
        0 0 D D F D D D D F D D D 0 0 0
        0 0 D D D D D D D D D D D 0 0 0
        0 0 A C C C C C C C C A B 0 0 0
        0 0 D C C C C C C C C C D D 0 0
        0 D D F F F B B F F F F D D 0 0
        0 0 0 A A A A A A A A A B 0 0 0
        0 0 0 0 F F F 0 0 F F F 0 0 0 0
    `);

    let mainCrouchRight = animation.createAnimation(ActionKind.CrouchRight, 100);
    animation.attachAnimation(hero, mainCrouchRight);
    mainCrouchRight.addAnimationFrame(img`
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 E E E E E E E E E E 0 0 0
        0 0 E E E E E E E E E E E E 0 0
        0 0 D E E D D D D D D D D D 0 0
        0 0 D E D D F D D D D F D D 0 0
        0 0 E D D D F D D D D F D D 0 0
        0 0 0 D D D F D D D D F D D 0 0
        0 0 0 D D D D D D D D D D D 0 0
        0 0 0 B A C C C C C C C C A 0 0
        0 0 D D C C C C C C C C C D 0 0
        0 0 D D F F F F B B F F F D D 0
        0 0 0 B A A A A A A A A A 0 0 0
        0 0 0 0 F F F 0 0 F F F 0 0 0 0
    `);

    /** jumping **/
    // Because there isn't currently an easy way to say "play this animation a single time
    // and stop at the end", this just adds a bunch of the same frame at the end to accomplish
    // the same behavior
    let mainJumpLeft = animation.createAnimation(ActionKind.JumpingLeft, 100);
    animation.attachAnimation(hero, mainJumpLeft)
    mainJumpLeft.addAnimationFrame(img`
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 E E E E E E E E E E 0 0 0
        0 0 E E E E E E E E E E E E 0 0
        0 0 D D D D D D D D D E E D 0 0
        0 0 D D F D D D D F D D E D 0 0
        0 0 D D F D D D D F D D D E 0 0
        0 0 D D F D D D D F D D D 0 0 0
        0 0 D D D D D D D D D D D 0 0 0
        0 0 A C C C C C C C C A B 0 0 0
        0 0 D D C C C C C C D D D 0 0 0
        0 0 D F F F B B F F F D D 0 0 0
        0 0 0 A A A A A A A A A B 0 0 0
        0 0 0 0 A A B 0 0 A A B 0 0 0 0
        0 0 0 0 A A B 0 0 A A B 0 0 0 0
        0 0 0 0 F F F 0 0 F F F 0 0 0 0
    `);
    mainJumpLeft.addAnimationFrame(img`
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 E E E E E E E E E E 0 0 0
        0 0 E E E E E E E E E E E E 0 0
        0 0 D D D D D D D D D E E D 0 0
        0 0 D D F D D D D F D D E D 0 0
        0 0 D D F D D D D F D D D E 0 0
        0 0 D D F D D D D F D D D 0 0 0
        0 0 D D D D D D D D D D D 0 0 0
        0 0 A C C C C C C C C A B 0 0 0
        0 0 D D C C C C C C D D D 0 0 0
        0 0 D F F F B B F F F D D 0 0 0
        0 0 0 A A A A A A A A A B 0 0 0
        0 0 0 0 A A B 0 0 A A B 0 0 0 0
        0 0 0 0 F F F 0 0 F F F 0 0 0 0
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
    `);
    for (let i = 0; i < 30; i++) {
        mainJumpLeft.addAnimationFrame(img`
            0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
            0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
            0 0 0 E E E E E E E E E E 0 0 0
            0 0 E E E E E E E E E E E E 0 0
            0 0 D D D D D D D D D E E D 0 0
            0 0 D D F D D D D F D D E D 0 0
            0 0 D D F D D D D F D D D E 0 0
            0 0 D D F D D D D F D D D 0 0 0
            0 D D D D D D D D D D D D 0 D 0
            0 D A B C C C C C C C C B A D 0
            0 D A C C C C C C C C C C A D 0
            0 0 0 F F F B B F F F F F 0 0 0
            0 0 0 A A A A A A A A A B 0 0 0
            0 0 0 0 A A B 0 0 A A B 0 0 0 0
            0 0 0 0 F F F 0 0 F F F 0 0 0 0
            0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        `);
    }

    let mainJumpRight = animation.createAnimation(ActionKind.JumpingRight, 100);
    animation.attachAnimation(hero, mainJumpRight)
    mainJumpRight.addAnimationFrame(img`
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 E E E E E E E E E E 0 0 0
        0 0 E E E E E E E E E E E E 0 0
        0 0 D E E D D D D D D D D D 0 0
        0 0 D E D D F D D D D F D D 0 0
        0 0 E D D D F D D D D F D D 0 0
        0 0 0 D D D F D D D D F D D 0 0
        0 0 0 D D D D D D D D D D D 0 0
        0 0 0 B A C C C C C C C C A 0 0
        0 0 0 D D D C C C C C C D D 0 0
        0 0 0 D D F F F B B F F F D 0 0
        0 0 0 B A A A A A A A A A 0 0 0
        0 0 0 0 B A A 0 0 B A A 0 0 0 0
        0 0 0 0 B A A 0 0 B A A 0 0 0 0
        0 0 0 0 F F F 0 0 F F F 0 0 0 0
    `);
    mainJumpRight.addAnimationFrame(img`
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        0 0 0 E E E E E E E E E E 0 0 0
        0 0 E E E E E E E E E E E E 0 0
        0 0 D E E D D D D D D D D D 0 0
        0 0 D E D D F D D D D F D D 0 0
        0 0 E D D D F D D D D F D D 0 0
        0 0 0 D D D F D D D D F D D 0 0
        0 0 0 D D D D D D D D D D D 0 0
        0 0 0 B A C C C C C C C C A 0 0
        0 0 0 D D D C C C C C C D D 0 0
        0 0 0 D D F F F B B F F F D 0 0
        0 0 0 B A A A A A A A A A 0 0 0
        0 0 0 0 B A A 0 0 B A A 0 0 0 0
        0 0 0 0 F F F 0 0 F F F 0 0 0 0
        0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
    `);
    for (let i = 0; i < 30; i++) {
        mainJumpRight.addAnimationFrame(img`
            0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
            0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
            0 0 0 E E E E E E E E E E 0 0 0
            0 0 E E E E E E E E E E E E 0 0
            0 0 D E E D D D D D D D D D 0 0
            0 0 D E D D F D D D D F D D 0 0
            0 0 E D D D F D D D D F D D 0 0
            0 0 0 D D D F D D D D F D D 0 0
            0 D 0 D D D D D D D D D D D D 0
            0 D A B C C C C C C C C B A D 0
            0 D A C C C C C C C C C C A D 0
            0 0 0 F F F F F B B F F F 0 0 0
            0 0 0 B A A A A A A A A A 0 0 0
            0 0 0 0 B A A 0 0 B A A 0 0 0 0
            0 0 0 0 F F F 0 0 F F F 0 0 0 0
            0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        `);
    }
}

function initializeCoinAnimation() {
    coinAnimation = animation.createAnimation(ActionKind.Idle, 200)
    coinAnimation.addAnimationFrame(img`
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 F F F F 0 0 0 0 0 0 
    	0 0 0 0 F F 5 5 5 5 F F 0 0 0 0 
    	0 0 0 0 F 5 5 5 5 5 5 F 0 0 0 0 
    	0 0 0 F 5 5 5 4 4 5 5 5 F 0 0 0 
    	0 0 0 F 5 5 5 4 4 5 5 5 F 0 0 0 
    	0 0 0 F 5 5 5 4 4 5 5 5 F 0 0 0 
    	0 0 0 F 5 5 5 4 4 5 5 5 F 0 0 0 
    	0 0 0 0 F 5 5 5 5 5 5 F 0 0 0 0 
    	0 0 0 0 F F 5 5 5 5 F F 0 0 0 0 
    	0 0 0 0 0 0 F F F F 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    `)
    coinAnimation.addAnimationFrame(img`
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 F F F F F F 0 0 0 0 0 0 
    	0 0 0 F F 5 F 5 5 5 F 0 0 0 0 0 
    	0 0 0 F 5 F 5 5 5 5 5 F 0 0 0 0 
    	0 0 F 5 F 5 5 5 4 5 5 F 0 0 0 0 
    	0 0 F 5 F 5 5 5 4 4 5 5 F 0 0 0 
    	0 0 F 5 F 5 5 5 4 4 5 5 F 0 0 0 
    	0 0 F 5 F 5 5 5 4 5 5 F 0 0 0 0 
    	0 0 0 F 5 F 5 5 5 5 5 F 0 0 0 0 
    	0 0 0 0 F 5 F 5 5 5 F 0 0 0 0 0 
    	0 0 0 0 F F F F F F 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    `)
    coinAnimation.addAnimationFrame(img`
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 F F F F F 0 0 0 0 0 0 
    	0 0 0 0 F F 5 F 5 F F 0 0 0 0 0 
    	0 0 0 F F 5 F 5 5 5 F 0 0 0 0 0 
    	0 0 0 F 5 F 5 5 5 5 F F 0 0 0 0 
    	0 0 0 F 5 F 5 5 4 5 5 F 0 0 0 0 
    	0 0 0 F 5 F 5 5 4 5 5 F 0 0 0 0 
    	0 0 0 F 5 F 5 5 5 5 F F 0 0 0 0 
    	0 0 0 F F 5 F 5 5 5 F 0 0 0 0 0 
    	0 0 0 0 F F 5 F 5 F F 0 0 0 0 0 
    	0 0 0 0 0 F F F F F 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    `)
    coinAnimation.addAnimationFrame(img`
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 F F F F 0 0 0 0 0 0 
    	0 0 0 0 0 F F F F F 0 0 0 0 0 0 
    	0 0 0 0 0 F 5 F 5 F F 0 0 0 0 0 
    	0 0 0 0 0 F 5 F 5 5 F 0 0 0 0 0 
    	0 0 0 0 0 F 5 F 5 5 F 0 0 0 0 0 
    	0 0 0 0 0 F 5 F 5 5 F 0 0 0 0 0 
    	0 0 0 0 0 F 5 F 5 5 F 0 0 0 0 0 
    	0 0 0 0 0 F 5 F 5 F F 0 0 0 0 0 
    	0 0 0 0 0 F F F F F 0 0 0 0 0 0 
    	0 0 0 0 0 0 F F F F 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    `)
    coinAnimation.addAnimationFrame(img`
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 F F F F 0 0 0 0 0 0 
    	0 0 0 0 0 0 F F F F F 0 0 0 0 0 
    	0 0 0 0 0 F F 5 F 5 F 0 0 0 0 0 
    	0 0 0 0 0 F 5 5 F 5 F 0 0 0 0 0 
    	0 0 0 0 0 F 5 5 F 5 F 0 0 0 0 0 
    	0 0 0 0 0 F 5 5 F 5 F 0 0 0 0 0 
    	0 0 0 0 0 F 5 5 F 5 F 0 0 0 0 0 
    	0 0 0 0 0 F F 5 F 5 F 0 0 0 0 0 
    	0 0 0 0 0 0 F F F F F 0 0 0 0 0 
    	0 0 0 0 0 0 F F F F 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    `)
    coinAnimation.addAnimationFrame(img`
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 F F F F F 0 0 0 0 0 
    	0 0 0 0 0 F F 5 F 5 F F 0 0 0 0 
    	0 0 0 0 0 F 5 5 5 F 5 F F 0 0 0 
    	0 0 0 0 F F 5 5 5 5 F 5 F 0 0 0 
    	0 0 0 0 F 5 5 4 5 5 F 5 F 0 0 0 
    	0 0 0 0 F 5 5 4 5 5 F 5 F 0 0 0 
    	0 0 0 0 F F 5 5 5 5 F 5 F 0 0 0 
    	0 0 0 0 0 F 5 5 5 F 5 F F 0 0 0 
    	0 0 0 0 0 F F 5 F 5 F F 0 0 0 0 
    	0 0 0 0 0 0 F F F F F 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    `)
    coinAnimation.addAnimationFrame(img`
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 F F F F F F 0 0 0 0 
    	0 0 0 0 0 F 5 5 5 F 5 F F 0 0 0 
    	0 0 0 0 F 5 5 5 5 5 F 5 F 0 0 0 
    	0 0 0 0 F 5 5 4 5 5 5 F 5 F 0 0 
    	0 0 0 F 5 5 4 4 5 5 5 F 5 F 0 0 
    	0 0 0 F 5 5 4 4 5 5 5 F 5 F 0 0 
    	0 0 0 0 F 5 5 4 5 5 5 F 5 F 0 0 
    	0 0 0 0 F 5 5 5 5 5 F 5 F 0 0 0 
    	0 0 0 0 0 F 5 5 5 F 5 F 0 0 0 0 
    	0 0 0 0 0 0 F F F F F F 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    	0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 
    `)
}

// set up hero animations
game.onUpdate(function () {
    if (hero.vx < 0) {
        heroFacingLeft = true;
    } else if (hero.vx > 0) {
        heroFacingLeft = false;
    }

    if (controller.down.isPressed()) {
        if (heroFacingLeft) {
            animation.setAction(hero, ActionKind.CrouchLeft);
        } else {
            animation.setAction(hero, ActionKind.CrouchRight);
        }
    } else if (hero.vy < 20 && hero.ay != 0) {
        if (heroFacingLeft) {
            animation.setAction(hero, ActionKind.JumpingLeft)
        } else {
            animation.setAction(hero, ActionKind.JumpingRight)
        }
    } else if (hero.vx < 0) {
        animation.setAction(hero, ActionKind.RunningLeft)
    } else if (hero.vx > 0) {
        animation.setAction(hero, ActionKind.RunningRight)
    } else {
        if (heroFacingLeft) {
            animation.setAction(hero, ActionKind.IdleLeft)
        } else {
            animation.setAction(hero, ActionKind.IdleRight)
        }
    }
})


sprites.onOverlap(SpriteKind.Player, SpriteKind.Bumper, function (sprite, otherSprite) {
    if (sprite.vy > 0 && !sprite.isHittingTile(CollisionDirection.Bottom)) {
        otherSprite.destroy(effects.ashes, 250)
        otherSprite.vy = -50
        info.changeScoreBy(1)
        music.powerUp.play()
    } else {
        info.changeLifeBy(-1)
        sprite.say("Ow!", invincibilityPeriod)
        music.powerDown.play()
    }
    pause(invincibilityPeriod)
})

function createEnemies() {
    // enemy that moves back and forth
    for (let value of scene.getTilesByType(2)) {
        let bumper = sprites.create(img`
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . 7 7 7 7 7 7 . . . . . .
            . . . 7 7 7 2 7 7 2 7 . . . . .
            . . . 7 7 7 2 7 7 2 7 7 . . . .
            . . 7 7 7 7 2 7 7 2 7 7 . . . .
            . . 7 7 7 7 7 7 7 2 7 7 7 . . .
            . . 7 7 7 7 7 7 7 7 2 7 7 7 . .
            . . 7 7 7 7 2 2 2 7 7 7 7 7 . .
            . . . 7 7 2 2 7 2 2 7 7 7 7 . .
            . . . 7 7 2 7 7 7 2 2 7 7 7 . .
            . . . . 7 7 7 7 7 7 7 7 7 7 . .
            . . . . . . 7 7 7 7 7 7 7 . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
        `, SpriteKind.Bumper)
        value.place(bumper)
        bumper.ay = gravity
        if (Math.percentChance(50)) {
            bumper.vx = 40
        } else {
            bumper.vx = -40
        }
    }
}

function createPlayer(player: Sprite) {
    player.ay = gravity
    scene.cameraFollowSprite(player)
    controller.moveSprite(player, 100, 0)
    player.z = 5
    info.setLife(3)
    info.setScore(0)
}

sprites.onOverlap(SpriteKind.Player, SpriteKind.Goal, function (sprite, otherSprite) {
    currentLevel += 1
    if (currentLevel < levelMaps.length) {
        game.splash("Next level unlocked!")
        initializeLevel(currentLevel)
    } else {
        game.over(true, effects.confetti)
    }
})

controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    attemptJump()
})

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    attemptJump()
})

function attemptJump() {
    // else if: either fell off a ledge, or double jumping
    if (hero.isHittingTile(CollisionDirection.Bottom)) {
        hero.vy = -4 * pixelsToMeters
    } else if (canDoubleJump) {
        let doubleJumpSpeed = -3 * pixelsToMeters
        // Good double jump
        if (hero.vy >= -40) {
            doubleJumpSpeed = -4.5 * pixelsToMeters
            hero.startEffect(effects.trail, 500)
            scene.cameraShake(2, 250)
        }
        hero.vy = doubleJumpSpeed
        canDoubleJump = false
    }
}

function initializeLevel(level: number) {
    clearGame()
    scene.setTileMap(levelMaps[level])
    effects.clouds.startScreenEffect()
    scene.placeOnRandomTile(hero, 1)
    createEnemies()
    spawnGoals()
}

// Uncommented tiles are unused
function initializeScene() {
    scene.setBackgroundImage(img`
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 8 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9 9 9 8 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9
        9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 8 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
        8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9 8 9
        9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9
    `)
    // player spawn point
    scene.setTile(1, img`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `, false)
    // bumper spawn point
    scene.setTile(2, img`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `, false)
    scene.setTile(3, img`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `, false)
    scene.setTile(4, img`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `, false)
    // coin spawn point
    scene.setTile(5, img`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `, false)
    // pipe top
    scene.setTile(6, img`
        . f f f f f f f f f f f f f f .
        f f f f f f f f f f f f f f f f
        f f 7 7 7 7 7 6 7 7 6 7 7 6 f f
        f 7 7 7 7 7 6 7 6 7 6 7 6 7 7 f
        f 7 7 7 7 7 6 6 6 6 7 6 7 7 7 f
        f f 7 7 7 7 6 6 6 7 6 7 7 6 f f
        f f f f f f f f f f f f f f f f
        f f f f f f f f f f f f f f f f
        f f 7 7 7 7 6 7 6 6 6 7 6 7 f f
        f 6 7 7 7 7 6 7 6 6 6 7 6 7 f f
        f 6 7 7 7 7 6 7 6 6 6 6 7 7 6 f
        f 6 7 7 7 7 6 7 6 6 6 6 6 7 6 f
        f 6 7 7 7 7 6 7 6 6 6 6 7 7 6 f
        f f 7 7 7 7 6 7 6 6 6 7 6 7 f f
        f f f f f f f f f f f f f f f f
        f f f f f f f f f f f f f f f f
    `, true)
    // pipe
    scene.setTile(7, img`
        f f 7 7 7 7 6 7 6 6 6 6 7 7 f f
        f 6 7 7 7 7 6 7 6 6 6 7 6 7 6 f
        f 6 7 7 7 7 6 7 6 6 6 6 7 7 6 f
        f 6 7 7 7 7 6 7 6 6 6 6 6 7 6 f
        f 6 7 7 7 7 6 7 6 6 6 6 7 7 6 f
        f 6 7 7 7 7 6 7 6 6 6 7 6 7 6 f
        f 6 7 7 7 7 6 7 6 6 6 6 7 7 6 f
        f 6 7 7 7 7 6 7 6 6 6 6 6 7 6 f
        f 6 7 7 7 7 6 7 6 6 6 6 7 7 6 f
        f 6 7 7 7 7 6 7 6 6 6 7 6 7 6 f
        f 6 7 7 7 7 6 7 6 6 6 6 7 7 6 f
        f 6 7 7 7 7 6 7 6 6 6 6 6 7 6 f
        f 6 7 7 7 7 6 7 6 6 6 6 7 7 6 f
        f f 7 7 7 7 6 7 6 6 6 7 6 7 f f
        f f f f f f f f f f f f f f f f
        f f f f f f f f f f f f f f f f
    `, true)
    scene.setTile(8, img`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `, false)
    scene.setTile(9, img`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `, false)
    scene.setTile(10, img`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `, false)
    scene.setTile(11, img`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `, false)
    scene.setTile(12, img`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `, false)
    scene.setTile(13, img`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `, false)
    // goal / flag spawn point
    scene.setTile(14, img`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `, false)
    // ground1
    scene.setTile(15, img`
        6 7 7 7 7 3 5 3 7 6 7 7 7 6 7 7
        7 7 7 7 7 7 3 7 7 7 7 2 7 7 7 7
        7 7 7 6 6 7 7 7 6 7 2 4 2 7 7 7
        7 7 6 6 6 6 6 7 6 6 7 2 6 6 7 7
        7 6 6 e e e 6 6 6 6 6 6 6 6 6 7
        6 6 e e d e e 6 e e 6 6 e e 6 6
        6 e e e e e e e e e e e e e e 6
        e e e e e d e e e d e e e e e e
        e e e e e e e e e e e e e e d e
        e e e e e e e e e e e e e e e e
        e e e e e e e e e e e e e e e e
        e e d e e e e e d e e e e e e e
        e e e e e e e e e e e e e e e e
        e e e e e e e e e e e e e e e d
        e e e e e e e e e e e e e e e e
        e d e e e e e e e d e e e e e e
    `, true)
}

function spawnGoals() {
    scene.placeOnRandomTile(sprites.create(img`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . 2 2 2 2 . . . . .
        . . . . . . . 2 3 3 2 2 2 . . .
        . . . . . . . 2 3 2 2 2 2 2 . .
        . . . . . . . 3 2 2 2 2 2 . . .
        . . . . . . . 2 2 2 2 . . . . .
        . . . . . . . b d . . . . . . .
        . . . . . . . b d . . . . . . .
        . . . . . . . b d . . . . . . .
        . . . . . . . b d . . . . . . .
        . . . . . . . b d . . . . . . .
        . . . . . . . d d . . . . . . .
        . . . . . . f f f f . . . . . .
        . . . . . f f f f f f . . . . .
        . . . . f f f f f f f f . . . .
    `, SpriteKind.Goal), 14)
    for (let value of scene.getTilesByType(5)) {
        let coin = sprites.create(img`
            0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
            0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
            0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
            0 0 0 0 0 0 F F F F 0 0 0 0 0 0
            0 0 0 0 F F 5 5 5 5 F F 0 0 0 0
            0 0 0 0 F 5 5 5 5 5 5 F 0 0 0 0
            0 0 0 F 5 5 5 4 4 5 5 5 F 0 0 0
            0 0 0 F 5 5 5 4 4 5 5 5 F 0 0 0
            0 0 0 F 5 5 5 4 4 5 5 5 F 0 0 0
            0 0 0 F 5 5 5 4 4 5 5 5 F 0 0 0
            0 0 0 0 F 5 5 5 5 5 5 F 0 0 0 0
            0 0 0 0 F F 5 5 5 5 F F 0 0 0 0
            0 0 0 0 0 0 F F F F 0 0 0 0 0 0
            0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
            0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
            0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
        `, SpriteKind.Coin)
        value.place(coin)
        animation.attachAnimation(coin, coinAnimation)
        animation.setAction(coin, ActionKind.Idle);
    }
}

function clearGame() {
    for (let value of sprites.allOfKind(SpriteKind.Bumper)) {
        value.destroy()
    }
    for (let value of sprites.allOfKind(SpriteKind.Coin)) {
        value.destroy()
    }
    for (let value of sprites.allOfKind(SpriteKind.Goal)) {
        value.destroy()
    }
}

sprites.onOverlap(SpriteKind.Player, SpriteKind.Coin, function (sprite, otherSprite) {
    otherSprite.destroy(effects.trail, 250)
    otherSprite.y += -3
    info.changeScoreBy(3)
    music.baDing.play()
})


// bumper movement
game.onUpdate(function () {
    for (let value of sprites.allOfKind(SpriteKind.Bumper)) {
        if (value.isHittingTile(CollisionDirection.Left)) {
            value.vx = 40
        } else if (value.isHittingTile(CollisionDirection.Right)) {
            value.vx = -40
        }
    }
})

// Reset double jump when standing on wall
game.onUpdate(function () {
    if (hero.isHittingTile(CollisionDirection.Bottom)) {
        hero.ay = 0;
        canDoubleJump = true
    } else {
        hero.ay = gravity
    }
})
