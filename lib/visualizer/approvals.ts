// Only reviewed, locally hosted projection textures belong here. Key each
// approval by its exact Shopware product/variant ID.
export const approvedTextures: Readonly<
  Partial<Record<string, { texture: string; pigment?: string }>>
> = {};
