// src/seeds/themes.ts
import Theme from "../models/theme.js";
export const seedThemes = async () => {
    const themes = [
        {
            preview: "/themes/thesis.png",
            name: "executive",
            slug: "executive",
            colors: {
                primary: "#000000",
                secondary: "#4F81BD",
                accent: "#4F81BD",
                background: "#FFFFFF",
                text: "#000000",
                textLight: "#666666",
            },
            fonts: {
                heading: "Arial",
                body: "Arial",
            },
            layouts: [
                {
                    type: "content",
                    placeholders: {
                        content: {
                            x: 12.841581364829397,
                            y: 8.872579833770779,
                            w: 2.119248687664042,
                            h: 3.108231627296588,
                        },
                    },
                    backgrounds: [],
                    shapes: [],
                },
                {
                    type: "content",
                    placeholders: {
                        content: {
                            x: 14.330212160979878,
                            y: -0.24794510061242345,
                            w: 5.5757852143482065,
                            h: 3.137979002624672,
                        },
                    },
                    backgrounds: [],
                    shapes: [],
                },
                {
                    type: "content",
                    placeholders: {
                        content: {
                            x: 16.983444881889763,
                            y: -0.4838746719160105,
                            w: 3.9238320209973754,
                            h: 5.75495406824147,
                        },
                    },
                    backgrounds: [],
                    shapes: [],
                },
                {
                    type: "content",
                    placeholders: {
                        content: {
                            x: 14.700398075240594,
                            y: 0.8181758530183727,
                            w: 7.472377515310586,
                            h: 3.6894860017497813,
                        },
                    },
                    backgrounds: [],
                    shapes: [],
                },
                {
                    type: "content",
                    placeholders: {
                        content: {
                            x: 14.330212160979878,
                            y: -0.24794510061242345,
                            w: 5.5757852143482065,
                            h: 3.137979002624672,
                        },
                    },
                    backgrounds: [],
                    shapes: [],
                },
                {
                    type: "content",
                    placeholders: {
                        content: {
                            x: 14.330212160979878,
                            y: -0.24794510061242345,
                            w: 5.5757852143482065,
                            h: 3.137979002624672,
                        },
                    },
                    backgrounds: [],
                    shapes: [],
                },
                {
                    type: "content",
                    placeholders: {
                        content: {
                            x: 14.700398075240594,
                            y: 0.8181758530183727,
                            w: 7.472377515310586,
                            h: 3.6894860017497813,
                        },
                    },
                    backgrounds: [],
                    shapes: [],
                },
                {
                    type: "content",
                    placeholders: {
                        content: {
                            x: 14.700398075240594,
                            y: 0.8181758530183727,
                            w: 7.472377515310586,
                            h: 3.6894860017497813,
                        },
                    },
                    backgrounds: [],
                    shapes: [],
                },
                {
                    type: "content",
                    placeholders: {
                        content: {
                            x: 10.65300634295713,
                            y: 8.57298118985127,
                            w: 5.656326552930883,
                            h: 1.295,
                        },
                    },
                    backgrounds: [],
                    shapes: [],
                },
                {
                    type: "content",
                    placeholders: {
                        content: {
                            x: 3.4930194663167105,
                            y: 4.210833333333333,
                            w: 13.01396106736658,
                            h: 5.914166666666667,
                        },
                    },
                    backgrounds: [],
                    shapes: [],
                },
                {
                    type: "content",
                    placeholders: {
                        content: {
                            x: 3.4930194663167105,
                            y: 4.6100393700787405,
                            w: 13.01396106736658,
                            h: 2.9975,
                        },
                    },
                    backgrounds: [],
                    shapes: [],
                },
            ],
        },
    ];
    try {
        await Theme.deleteMany({});
        await Theme.insertMany(themes);
        console.log("✅ Themes seeded successfully");
    }
    catch (error) {
        console.error("❌ Error seeding themes:", error);
    }
};
