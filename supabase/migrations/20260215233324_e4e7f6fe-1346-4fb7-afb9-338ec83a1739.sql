
-- Allow anyone to insert into cartproduct
CREATE POLICY "Anyone can insert cart products"
ON public.cartproduct
FOR INSERT
WITH CHECK (true);

-- Allow anyone to update cart products
CREATE POLICY "Anyone can update cart products"
ON public.cartproduct
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow anyone to delete cart products
CREATE POLICY "Anyone can delete cart products"
ON public.cartproduct
FOR DELETE
USING (true);
