library(tidyverse)

pm_cmax <- tibble(
  pm = c(0.01, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 0.99, 1),
  cmax = c(0.99, 0.94, 0.918, 0.883, 0.855, 0.813, 0.78, 0.744, 0.704, 0.66, 0.6165, 0.568, 0.518, 0.459, 0.4, 0.332, 0.2595, 0.181, 0.095, 0.0198, 0)
)

ggplot(data = pm_cmax, mapping = aes(pm, cmax)) +
  geom_smooth(color = 'black', size = 0.5, se = FALSE) +
#  geom_line() +
  theme(axis.title = element_text(size = 12), axis.text = element_text(size = 14)) +
  labs(x = "P(w)", y = expression(c[max]))